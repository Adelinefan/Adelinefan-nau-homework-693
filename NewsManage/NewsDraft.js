import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, notification } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
const { confirm } = Modal;
export default function NewsDraft(props) {
    const [dataSource, setdataSource] = useState([]);
    const { username } = JSON.parse(localStorage.getItem('token'));
    useEffect(() => {
        axios.get(`/news?author=${username}&auditState=0&_expand=category`).then((res) => {
            setdataSource(res.data);
        });
    }, [username]);
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>;
            }
        },
        {
            title: '新闻标题',
            dataIndex: 'title',
            render: (title, item) => {
                return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>;
            }
        },
        {
            title: '作者',
            dataIndex: 'author'
        },
        {
            title: '分类',
            dataIndex: 'category',
            render: (category) => {
                return category.title;
            }
        },

        {
            title: '操作',
            render: (item) => {
                return (
                    <div>
                        <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)}></Button>
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => {
                                props.history.push(`/news-manage/update/${item.id}`);
                            }}
                        ></Button>
                        <Button type="primary" shape="circle" icon={<UploadOutlined />} onClick={() => handleCheck(item.id)}></Button>
                    </div>
                );
            }
        }
    ];
    const confirmMethod = (item) => {
        confirm({
            title: 'Do you want to delete items?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            onOk() {
                deleteMethod(item);
            },
            onCancel() {
                console.log('Cancel');
            }
        });
    };
    const deleteMethod = (item) => {
        setdataSource(dataSource.filter((data) => data.id !== item.id));
        axios.delete(`/news/${item.id}`);
    };
    const handleCheck = (id) => {
        axios
            .patch(`/news/${id}`, {
                auditState: 1
            })
            .then((res) => {
                props.history.push(`/audit-manage/list`);
                notification.open({
                    message: '提醒框',
                    description: `您可以到新闻列表中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: 5
                }}
                rowKey={(item) => item.id}
            />
        </div>
    );
}
