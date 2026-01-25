import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Space, Message, Modal, Form, Switch, Popconfirm } from '@arco-design/web-react';
import { IconEdit, IconPlus, IconSearch, IconFile, IconDelete } from '@arco-design/web-react/icon';
import { getResources, createResource, updateResource, deleteResource, Resource } from '../../../services/rbac';

const ResourcesTab: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Resource[]>([]);
    const [searchText, setSearchText] = useState('');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const resources = await getResources();
            setData(resources);
        } catch (error) {
            Message.error('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (resource: Resource) => {
        setSelectedResource(resource);
        editForm.setFieldsValue({
            resourceName: resource.resourceName,
            description: resource.description,
            resourceType: resource.resourceType,
            isActive: resource.isActive
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validate();
            const result = await updateResource(selectedResource?._id!, {
                resourceName: values.resourceName,
                description: values.description,
                resourceType: values.resourceType,
                isActive: values.isActive
            });

            if (result.success) {
                Message.success('Resource updated successfully');
                setEditModalVisible(false);
                fetchResources();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to update resource');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const values = await addForm.validate();
            const result = await createResource({
                resourceName: values.resourceName,
                description: values.description,
                resourceType: values.resourceType,
                isActive: true
            });

            if (result.success) {
                Message.success('Resource created successfully');
                setAddModalVisible(false);
                addForm.resetFields();
                fetchResources();
            } else {
                Message.error(result.message);
            }
        } catch (error: any) {
            Message.error('Failed to create resource');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteResource(id);
            if (result.success) {
                Message.success('Resource deleted successfully');
                fetchResources();
            } else {
                Message.error(result.message);
            }
        } catch (error) {
            Message.error('Failed to delete resource');
        }
    };

    const filteredData = data.filter(item =>
        item.resourceName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Resource Name',
            dataIndex: 'resourceName',
            render: (resourceName: string) => (
                <Space>
                    <IconFile style={{ color: '#2D5A9E' }} />
                    <span style={{ fontWeight: 600 }}>{resourceName}</span>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Type',
            dataIndex: 'resourceType',
            render: (resourceType: string) => resourceType || 'N/A',
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
            render: (_: any, record: Resource) => (
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
                        title="Are you sure you want to delete this resource?"
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
                    placeholder="Search resources"
                    value={searchText}
                    onChange={setSearchText}
                />
                <Button type="primary" icon={<IconPlus />} onClick={() => setAddModalVisible(true)}>
                    Add Resource
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

            {/* Edit Resource Modal */}
            <Modal
                title="Edit Resource"
                visible={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                autoFocus={false}
                focusLock={true}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Resource Name"
                        field="resourceName"
                        rules={[{ required: true, message: 'Please enter resource name' }]}
                    >
                        <Input placeholder="e.g., Dashboard, Editor, Settings" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the resource/page..."
                            rows={4}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Type"
                        field="resourceType"
                    >
                        <Input placeholder="e.g., page, module, feature" />
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

            {/* Add Resource Modal */}
            <Modal
                title="Add New Resource"
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
                        label="Resource Name"
                        field="resourceName"
                        rules={[{ required: true, message: 'Please enter resource name' }]}
                    >
                        <Input placeholder="e.g., Dashboard, Editor, Settings" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        field="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Describe the resource/page..."
                            rows={4}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Type"
                        field="resourceType"
                    >
                        <Input placeholder="e.g., page, module, feature" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourcesTab;
