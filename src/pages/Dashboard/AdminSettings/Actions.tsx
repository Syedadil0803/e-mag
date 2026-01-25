import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Space, Message, Modal, Form, Switch, Popconfirm } from '@arco-design/web-react';
import { IconEdit, IconPlus, IconSearch, IconLock, IconDelete } from '@arco-design/web-react/icon';
import { getActions, createAction, updateAction, deleteAction, Action } from '../../../services/rbac';

const ActionsTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Action[]>([]);
    const [searchText, setSearchText] = useState('');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        try {
            setLoading(true);
            const actions = await getActions();
            setData(actions);
        } catch (error) {
            Message.error('Failed to fetch actions');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (action: Action) => {
        setSelectedAction(action);
        editForm.setFieldsValue({
            actionName: action.actionName,
            description: action.description
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validate();
            const result = await updateAction(selectedAction?._id!, {
                actionName: values.actionName,
                description: values.description
            });

            if (result.success) {
                Message.success('Action updated successfully');
                setEditModalVisible(false);
                fetchActions();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to update action');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validate();
            const result = await createAction({
                actionName: values.actionName,
                description: values.description
            });

            if (result.success) {
                Message.success('Action created successfully');
                setAddModalVisible(false);
                addForm.resetFields();
                fetchActions();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to create action');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteAction(id);
            if (result.success) {
                Message.success('Action deleted successfully');
                fetchActions();
            } else {
                Message.error(result.message);
            }
        } catch (error) {
            Message.error('Failed to delete action');
        }
    };

    const filteredData = data.filter(item =>
        item.actionName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Action Name',
            dataIndex: 'actionName',
            render: (actionName: string) => (
                <Space>
                    <IconLock style={{ color: '#2D5A9E' }} />
                    <span style={{ fontWeight: 600 }}>{actionName}</span>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            render: (_: any, record: Action) => (
                <Space>
                    <Button
                        type="text"
                        icon={<IconEdit />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this action?"
                        onOk={() => handleDelete(record._id!)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            icon={<IconDelete />}
                            size="small"
                            status="danger"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Input
                    style={{ width: 300 }}
                    prefix={<IconSearch />}
                    placeholder="Search actions"
                    value={searchText}
                    onChange={setSearchText}
                />
                <Button type="primary" icon={<IconPlus />} onClick={() => setAddModalVisible(true)}>
                    Add Action
                </Button>
            </div>
            <Table
                loading={loading}
                columns={columns}
                data={filteredData}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showTotal: true,
                }}
            />

            {/* Edit Action Modal */}
            <Modal
                title="Edit Action"
                visible={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                autoFocus={false}
                focusLock={true}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Action Name"
                        field="actionName"
                        rules={[{ required: true, message: 'Please enter action name' }]}
                    >
                        <Input placeholder="e.g., create, read, update, delete" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the action/permission..."
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Action Modal */}
            <Modal
                title="Add New Action"
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
                        label="Action Name"
                        field="actionName"
                        rules={[{ required: true, message: 'Please enter action name' }]}
                    >
                        <Input placeholder="e.g., create, read, update, delete" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the action/permission..."
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ActionsTab;
