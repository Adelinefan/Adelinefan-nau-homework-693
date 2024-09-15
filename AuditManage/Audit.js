import React, { useEffect, useState } from 'react';
import { Table, Button, notification } from 'antd';
import axios from 'axios';
export default function Audit() {
    const { roleId, region, username } = JSON.parse(localStorage.getItem('token'));
    const [dataSource, setdataSource] = useState([]);
    useEffect(() => {
        const roleObj = {
            1: 'superadmin',
            2: 'admin',
            3: 'editor'
        };
        axios.get(`/news?auditState=1&_expand=category`).then((res) => {
            const list = res.data;
            setdataSource(
                roleObj[roleId] === 'superadmin'
                    ? list
                    : [
                          ...list.filter((item) => item.author === username),
                          ...list.filter((item) => (item.region === region && roleObj[item.roleId] === 'editor'))
                      ]
            );
        });
    }, [roleId, region, username]);
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
            title: '操作',
            key: 'operation',
            render: (item) => (
                <div>
                    <Button type="primary" onClick={() => handleOperation(item.id, 2, 1)}>
                        通过
                    </Button>
                    <Button type="danger" onClick={() => handleOperation(item.id, 3, 0)}>
                        驳回
                    </Button>
                </div>
            )
        }
    ];
    const handleOperation = (id, auditState, publishState) => {
        setdataSource(dataSource.filter((data) => data.id != id));
        axios
            .patch(`/news/${id}`, {
                auditState,
                publishState
            })
            .then((res) => {
                notification.open({
                    message: '提醒框',
                    description: `您可以到审核管理的审核列表中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    return (
        <div>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    pageSize: 5
                }}
            />
        </div>
    );
}
