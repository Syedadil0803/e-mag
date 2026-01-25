import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Space, Message, Modal, Form, Switch } from '@arco-design/web-react';
import { IconEdit, IconPlus, IconSearch, IconSafe } from '@arco-design/web-react/icon';
import { authAxios } from '../../../services/axios.auth';
import { usePermissions } from '../../../hooks/usePermissions';

interface Role {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
}

const RolesTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Role[]>([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Permission checks
    const { canPerformAction } = usePermissions();
    const canManageSettings = canPerformAction('Settings', 'View');
    const canCreate = canManageSettings;
    const canEdit = canManageSettings;

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await authAxios.get('/Roles/getAll');
            setData(response.data);
        } catch (error) {
            Message.error('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        editForm.setFieldsValue({
            name: role.name,
            description: role.description,
            isActive: role.isActive
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validate();
            await authAxios.put(`/Roles/${selectedRole?._id}`, {
                name: values.name,
                description: values.description,
                isActive: values.isActive
            });
            Message.success('Role updated successfully');
            setEditModalVisible(false);
            fetchRoles();
        } catch (error: any) {
            Message.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validate();
            await authAxios.post('/Roles/create', {
                name: values.name,
                description: values.description,
                isActive: true
            });
            Message.success('Role created successfully');
            setAddModalVisible(false);
            addForm.resetFields();
            fetchRoles();
        } catch (error: any) {
            Message.error(error.response?.data?.message || 'Failed to create role');
        }
    };

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            render: (name: string) => (
                <Space>
                    <IconSafe style={{ color: '#2D5A9E' }} />
                    <span style={{ fontWeight: 600 }}>{name.replace(/_/g, ' ')}</span>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'} bordered>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            render: (_: any, record: Role) => (
                canEdit ? (
                    <Button type="text" icon={<IconEdit />} size="small" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                ) : null
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Input
                    style={{ width: 300 }}
                    prefix={<IconSearch />}
                    placeholder="Search roles"
                />
                {canCreate && (
                    <Button type="primary" icon={<IconPlus />} onClick={() => setAddModalVisible(true)}>
                        Add Role
                    </Button>
                )}
            </div>
            <Table
                loading={loading}
                columns={columns}
                data={data}
                rowKey="_id"
                pagination={false}
            />

            {/* Edit Role Modal */}
            <Modal
                title="Edit Role"
                visible={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                autoFocus={false}
                focusLock={true}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Role Name"
                        field="name"
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input placeholder="e.g., Content_Reviewer" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the role's responsibilities..."
                            rows={4}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Status"
                        field="isActive"
                        triggerPropName="checked"
                    >
                        <Switch checkedText="Active" uncheckedText="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Role Modal */}
            <Modal
                title="Add New Role"
                visible={addModalVisible}
                onOk={handleAddSubmit}
                onCancel={() => {
                    setAddModalVisible(false);
                    addForm.resetFields();
                }}
                autoFocus={false}
                focusLock={true}
            >
                <Form form={addForm} layout="vertical">
                    <Form.Item
                        label="Role Name"
                        field="name"
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input placeholder="e.g., Content_Reviewer" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the role's responsibilities..."
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolesTab;
