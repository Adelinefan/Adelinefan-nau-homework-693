import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, notification } from 'antd';
export default function AuditList(props) {
    const { username } = JSON.parse(localStorage.getItem('token'));
    const [auditList, setAuditList] = useState([]);
    const auditStateList = ['未审核', '审核中', '已通过', '未通过'];
    const handleCancle = (id) => {
        setAuditList(auditList.filter((data) => data.id !== id));
        axios
            .patch(`/news/${id}`, {
                auditState: 0
            })
            .then(() => {
                notification.open({
                    message: '提醒框',
                    description: `您可以到草稿列表中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    const handlePublish = (id) => {
        axios
            .patch(`/news/${id}`, {
                publishState: 2,
                publishTime: Date.now()
            })
            .then((res) => {
                props.history.push(`/publish-manage/published`);
                notification.open({
                    message: '提醒框',
                    description: `您可以到发布管理中已发布中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    const handleUpdate = (item) => {
        props.history.push(`/news-manage/update/${item.id}`);
    };
    useEffect(() => {
        axios(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
            setAuditList(res.data);
        });
    }, [username]);
    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',
            key: 'title',
            render: (title, item) => {
                return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>;
            }
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author'
        },
        {
            title: '新闻分类',
            dataIndex: 'category',
            key: 'category',
            render: (category) => {
                return <div>{category.title}</div>;
            }
        },
        {
            title: '审核状态',
            key: 'auditState',
            dataIndex: 'auditState',
            render: (auditState) => {
                const auditCurrentState = auditStateList[auditState];
                var color;
                if (auditCurrentState === '未审核') {
                    color = 'red';
                }
                if (auditCurrentState === '审核中') {
                    color = 'green';
                }
                if (auditCurrentState === '已通过') {
                    color = 'blue';
                }
                if (auditCurrentState === '未通过') {
                    color = 'orange';
                }
                return (
                    <div>
                        <Tag color={color} key="auditState">
                            {auditCurrentState}
                        </Tag>
                    </div>
                );
            }
        },
        {
            title: '操作',
            key: 'operation',
            render: (item) => (
                <div>
                    {item.auditState === 1 && (
                        <Button type="danger" onClick={() => handleCancle(item.id)}>
                            撤销
                        </Button>
                    )}
                    {item.auditState === 2 && (
                        <Button type="primary" onClick={() => handlePublish(item.id)}>
                            发布
                        </Button>
                    )}
                    {item.auditState === 3 && (
                        <Button type="primary" onClick={() => handleUpdate(item)}>
                            更新
                        </Button>
                    )}
                </div>
            )
        }
    ];
    return (
        <div>
            <Table
                columns={columns}
                dataSource={auditList}
                pagination={{
                    pageSize: 5
                }}
            />
        </div>
    );
}
