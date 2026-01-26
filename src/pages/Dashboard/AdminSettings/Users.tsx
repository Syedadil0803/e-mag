import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Space, Message, Avatar, Modal, Form, Select, Switch } from '@arco-design/web-react';
import { IconEdit, IconPlus, IconSearch, IconSettings } from '@arco-design/web-react/icon';
import { authAxios } from '../../../services/axios.auth';
import { usePermissions } from '../../../hooks/usePermissions';

interface User {
    _id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    role_id?: string;
    isActive: boolean;
}

interface Role {
    _id: string;
    name: string;
    description: string;
}

const UsersTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User[]>([]);
    const [searchText, setSearchText] = useState('');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [roles, setRoles] = useState<Role[]>([]);

    // Permission checks
    const { canPerformAction } = usePermissions();
    const canManageSettings = canPerformAction('Settings', 'View');
    const canCreate = canManageSettings;
    const canEdit = canManageSettings;

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authAxios.get('/Users/getAll');
            const usersData = response.data;

            // Fetch roles if not already loaded
            if (roles.length === 0) {
                const rolesResponse = await authAxios.get('/Roles/getAll');
                setRoles(rolesResponse.data);

                // Map role_id to role name
                const usersWithRoles = usersData.map((user: any) => ({
                    ...user,
                    role: rolesResponse.data.find((r: Role) => r._id === user.role_id)?.name || 'No Role'
                }));
                setData(usersWithRoles);
            } else {
                // Map role_id to role name using existing roles
                const usersWithRoles = usersData.map((user: any) => ({
                    ...user,
                    role: roles.find((r: Role) => r._id === user.role_id)?.name || 'No Role'
                }));
                setData(usersWithRoles);
            }
        } catch (error) {
            Message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await authAxios.get('/Roles/getAll');
            setRoles(response.data);
        } catch (error) {
            Message.error('Failed to fetch roles');
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setFieldsValue({
            role_id: user.role_id || '',
            isActive: user.isActive
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validate();
            await authAxios.put(`/Users/${selectedUser?._id}`, {
                role_id: values.role_id,
                isActive: values.isActive
            });
            Message.success('User updated successfully');
            setEditModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            Message.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validate();
            await authAxios.post('/Users/create', {
                ...values,
                external_id: `ext_${values.username}_${Date.now()}`
            });
            Message.success('User created successfully');
            setAddModalVisible(false);
            addForm.resetFields();
            fetchUsers();
        } catch (error: any) {
            Message.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const columns = [
        {
            title: 'Name',
            render: (_: any, record: User) => (
                <Space>
                    <Avatar size={32}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${record.name}`} alt="avatar" />
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                        <div style={{ fontSize: 11, color: '#86909c' }}>{record._id.slice(-6).toUpperCase()}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Assigned Role(s)',
            dataIndex: 'role',
            render: (role: string) => (
                <Space>
                    <span>{role || 'No Role'}</span>
                    {role === 'Super Administrator' && <span style={{ color: '#00B42A' }}>✓</span>}
                </Space>
            ),
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
            render: (_: any, record: User) => (
                canEdit ? (
                    <Button type="text" icon={<IconSettings />} size="small" onClick={() => handleEdit(record)}>
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
                    placeholder="Search users"
                />
                {canCreate && (
                    <Button type="primary" icon={<IconPlus />} onClick={() => setAddModalVisible(true)}>
                        Add User
                    </Button>
                )}
            </div>
            <Table
                loading={loading}
                columns={columns}
                data={data}
                pagination={false}
                rowKey="_id"
            />

            {/* Edit User Modal */}
            <Modal
                title="Edit User"
                visible={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                autoFocus={false}
                focusLock={true}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item label="User" style={{ marginBottom: 16 }}>
                        <Input value={selectedUser?.name} disabled />
                    </Form.Item>
                    <Form.Item
                        label="Assign Role"
                        field="role_id"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select a role">
                            {roles.map(role => (
                                <Select.Option key={role._id} value={role._id}>
                                    {role.name.replace(/_/g, ' ')}
                                </Select.Option>
                            ))}
                        </Select>
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

            {/* Add User Modal */}
            <Modal
                title="Add New User"
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
                        label="Full Name"
                        field="name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="John Doe" />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        field="email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' }
                        ]}
                    >
                        <Input placeholder="john@university.edu" />
                    </Form.Item>
                    <Form.Item
                        label="Username"
                        field="username"
                        rules={[{ required: true, message: 'Please enter username' }]}
                    >
                        <Input placeholder="johndoe" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        field="password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>
                    <Form.Item
                        label="Assign Role"
                        field="role_id"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select a role">
                            {roles.map(role => (
                                <Select.Option key={role._id} value={role._id}>
                                    {role.name.replace(/_/g, ' ')}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UsersTab;
