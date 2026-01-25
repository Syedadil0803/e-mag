import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Message, Modal, Form, Select, Popconfirm, Tag } from '@arco-design/web-react';
import { IconEdit, IconPlus, IconSearch, IconSettings, IconDelete } from '@arco-design/web-react/icon';
import { getPolicies, createPolicy, updatePolicy, deletePolicy, Policy, getResources, getActions } from '../../../services/rbac';
import { authAxios } from '../../../services/axios.auth';
import { usePermissions } from '../../../hooks/usePermissions';

interface Role {
    _id: string;
    name: string;
}

const PoliciesTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Policy[]>([]);
    const [searchText, setSearchText] = useState('');
    const [addModalVisible, setAddModalVisible] = useState(false);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Dropdown options
    const [roles, setRoles] = useState<Role[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);

    // Permission checks
    const { canPerformAction } = usePermissions();
    const canManageSettings = canPerformAction('Settings', 'View');
    const canCreate = canManageSettings;
    const canEdit = canManageSettings;
    const canDelete = canManageSettings;

    useEffect(() => {
        fetchPolicies();
        fetchDropdownData();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const policies = await getPolicies();
            setData(policies);
        } catch (error) {
            Message.error('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch roles
            const rolesResponse = await authAxios.get('/Roles/getAll');
            setRoles(rolesResponse.data);

            // Fetch resources
            const resourcesData = await getResources();
            setResources(resourcesData);

            // Fetch actions
            const actionsData = await getActions();
            setActions(actionsData);
        } catch (error) {
            Message.error('Failed to fetch dropdown data');
        }
    };

    const handleEdit = (policy: Policy) => {
        setSelectedPolicy(policy);
        editForm.setFieldsValue({
            roleId: policy.roleId,
            resourceId: policy.resourceId,
            actionId: policy.actionId
        });
        setEditModalVisible(true);
    };

    const getDefaultActionId = () => {
        const viewAction = actions.find(a =>
            a.actionName.toLowerCase() === 'view' ||
            a.actionName.toLowerCase() === 'access'
        );
        return viewAction ? viewAction._id : (actions.length > 0 ? actions[0]._id : null);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validate();
            // Auto-assign default action if not present
            const defaultActionId = getDefaultActionId();
            if (!defaultActionId) {
                Message.error('No valid action found in backend');
                return;
            }

            const payload = {
                ...values,
                actionId: defaultActionId
            };

            const result = await updatePolicy(selectedPolicy?._id!, payload);

            if (result.success) {
                Message.success('Policy updated successfully');
                setEditModalVisible(false);
                fetchPolicies();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to update policy');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validate();
            // Auto-assign default action
            const defaultActionId = getDefaultActionId();
            if (!defaultActionId) {
                Message.error('No valid action found in backend');
                return;
            }

            const payload = {
                ...values,
                actionId: defaultActionId
            };

            const result = await createPolicy(payload);

            if (result.success) {
                Message.success('Policy created successfully');
                setAddModalVisible(false);
                addForm.resetFields();
                fetchPolicies();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to create policy');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deletePolicy(id);
            if (result.success) {
                Message.success('Policy deleted successfully');
                fetchPolicies();
            } else {
                Message.error(result.message);
            }
        } catch (error) {
            Message.error('Failed to delete policy');
        }
    };

    const getRoleName = (roleId: string) => {
        const role = roles.find(r => r._id === roleId);
        return role ? role.name : roleId;
    };

    const getResourceName = (resourceId: string) => {
        const resource = resources.find(r => r._id === resourceId);
        return resource ? resource.resourceName : resourceId;
    };

    const getActionName = (actionId: string) => {
        const action = actions.find(a => a._id === actionId);
        return action ? action.actionName : actionId;
    };

    // Group policies by role
    const groupedData = React.useMemo(() => {
        const groups: Record<string, Policy[]> = {};
        data.forEach(policy => {
            if (!groups[policy.roleId]) {
                groups[policy.roleId] = [];
            }
            groups[policy.roleId].push(policy);
        });
        return Object.entries(groups).map(([roleId, policies]) => ({
            roleId,
            roleName: getRoleName(roleId),
            policies
        }));
    }, [data, roles]);

    const filteredGroupedData = groupedData.filter(group => {
        const searchLower = searchText.toLowerCase();
        // Search by role name or any of the resource names
        return group.roleName.toLowerCase().includes(searchLower) ||
            group.policies.some(p => getResourceName(p.resourceId).toLowerCase().includes(searchLower));
    });

    const columns = [
        {
            title: 'Role',
            dataIndex: 'roleName',
            width: 250,
            render: (roleName: string) => (
                <Space>
                    <IconSettings style={{ color: '#2D5A9E' }} />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{roleName}</span>
                </Space>
            ),
        },
        {
            title: 'Assigned Permissions (Resources)',
            dataIndex: 'policies',
            render: (policies: Policy[]) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {policies.map(policy => (
                        <div key={policy._id} style={{ display: 'inline-block' }}>
                            <Tag
                                style={{
                                    padding: '4px 8px',
                                    fontSize: 13,
                                    borderColor: '#e5e6eb',
                                    background: '#f7f8fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                {getResourceName(policy.resourceId)}
                                {canDelete && (
                                    <Popconfirm
                                        title={
                                            <div style={{ maxWidth: 260 }}>
                                                Are you sure you want to remove the
                                                <span style={{ fontWeight: 'bold' }}> {getResourceName(policy.resourceId)} </span>
                                                permission from this role?
                                            </div>
                                        }
                                        onOk={() => handleDelete(policy._id!)}
                                        okText="Yes, Remove"
                                        cancelText="Cancel"
                                        position="top"
                                    >
                                        <IconDelete
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: 12,
                                                color: '#86909c',
                                                marginLeft: 4
                                            }}
                                            className="delete-icon-hover"
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#f53f3f'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#86909c'}
                                        />
                                    </Popconfirm>
                                )}
                            </Tag>
                        </div>
                    ))}
                    {policies.length === 0 && <span style={{ color: '#86909c' }}>No permissions assigned</span>}
                    {canCreate && (
                        <Button
                            type="text"
                            size="mini"
                            icon={<IconPlus />}
                            style={{ marginLeft: 4 }}
                            onClick={() => {
                                // Pre-fill add modal with this role
                                addForm.setFieldValue('roleId', policies[0]?.roleId);
                                setAddModalVisible(true);
                            }}
                        >
                            Add
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const PolicyForm = ({ form }: { form: any }) => {
        const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(form.getFieldValue('roleId'));

        // Sync local state with form value when modal opens or form changes
        useEffect(() => {
            const roleId = form.getFieldValue('roleId');
            if (roleId) {
                setSelectedRoleId(roleId);
            }
        }, [addModalVisible, editModalVisible, form]);

        // Get resources that already have policies for the selected role
        const getExistingResourceIds = (roleId: string): Set<string> => {
            const existingPolicies = data.filter(policy => policy.roleId === roleId);
            return new Set(existingPolicies.map(policy => policy.resourceId));
        };

        const existingResourceIds = selectedRoleId ? getExistingResourceIds(selectedRoleId) : new Set();

        return (
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Role"
                    field="roleId"
                    rules={[{ required: true, message: 'Please select a role' }]}
                >
                    <Select
                        placeholder="Select role"
                        onChange={(value) => {
                            setSelectedRoleId(value as string);
                            // Reset resource selection when role changes
                            form.setFieldValue('resourceId', undefined);
                        }}
                    >
                        {roles.map(role => (
                            <Select.Option key={role._id} value={role._id}>
                                {role.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Resource"
                    field="resourceId"
                    rules={[{ required: true, message: 'Please select a resource' }]}
                >
                    <Select placeholder="Select resource">
                        {resources.map(resource => {
                            const isDisabled = existingResourceIds.has(resource._id);
                            return (
                                <Select.Option
                                    key={resource._id}
                                    value={resource._id}
                                    disabled={isDisabled}
                                >
                                    {resource.resourceName}
                                    {isDisabled && ' (Already assigned)'}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>
            </Form>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Input
                    style={{ width: 300 }}
                    prefix={<IconSearch />}
                    placeholder="Search policies"
                    value={searchText}
                    onChange={setSearchText}
                />
                {canCreate && (
                    <Button type="primary" icon={<IconPlus />} onClick={() => setAddModalVisible(true)}>
                        Add Policy
                    </Button>
                )}
            </div>
            <Table
                loading={loading}
                columns={columns}
                data={filteredGroupedData}
                rowKey="roleId"
                pagination={{
                    pageSize: 10,
                    showTotal: true,
                }}
            />

            {/* Edit Policy Modal */}
            <Modal
                title="Edit Policy"
                visible={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                autoFocus={false}
                focusLock={true}
            >
                <PolicyForm form={editForm} />
            </Modal>

            {/* Add Policy Modal */}
            <Modal
                title="Add New Policy"
                visible={addModalVisible}
                onOk={handleAddSubmit}
                onCancel={() => {
                    setAddModalVisible(false);
                    addForm.resetFields();
                }}
                autoFocus={false}
                focusLock={true}
            >
                <PolicyForm form={addForm} />
            </Modal>
        </div>
    );
};

export default PoliciesTab;
