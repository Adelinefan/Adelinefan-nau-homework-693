import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Modal, Popover, Switch } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
export default function RightList() {
    const [dataSource, setdataSource] = useState([]);
    useEffect(() => {
        axios(`/rights?_embed=children`).then((res) => {
            const list = res.data;
            // 去除第一个首页的childern
            list.forEach((item) => {
                if (item.children.length === 0) item.children = '';
            });
            setdataSource(res.data);
        });
    }, []);
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>;
            }
        },
        {
            title: '权限名称',
            dataIndex: 'title',
            key: 'age'
        },
        {
            title: '权限路径',
            dataIndex: 'key',
            render: (key) => {
                return <Tag color="blue">{key}</Tag>;
            }
        },
        {
            title: '操作',
            render: (item) => {
                return (
                    <div>
                        <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)}></Button>
                        <Popover
                            content={
                                <div style={{ textAlign: 'center' }}>
                                    <Switch checked={item.pagepermisson} onChange={() => SwitchMethod(item)}></Switch>
                                </div>
                            }
                            title="页面配置项"
                            trigger={item.pagepermisson === undefined ? '' : 'click'}
                        >
                            <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.pagepermisson === undefined}></Button>
                        </Popover>
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
        console.log(item);
        // 将与要删除的id与所有的id进行比较，不相同的过滤出来
        console.log(item.id);
        if (item.grade === 1) {
            //这个地方的datasource并没有改变，页面可以渲染更新是因为setdatasource（）里面的内容是过滤出来的内容，和下面不一样
            setdataSource(dataSource.filter((data) => data.id !== item.id));
            axios.delete(`/rights/${item.id}`);
        } else {
            // console.log(item)
            // console.log(item.rightId);
            // console.log(item.id)
            // 先通过rightId找到一级的那一项然后再通过一级的一项找到二级应该删除的那项
            let list = dataSource.filter((data) => data.id === item.rigthId);
            // console.log(list)
            //datasource发生改变是因为list这里发生了变化
            list[0].children = list[0].children.filter((data) => data.id !== item.id);
            // dataSource.filter()只能保证一层（一级没有什么影响）不发生改变，datasource并没有发生改变，所以要重新渲染页面的时候需要展开
            setdataSource([...dataSource]);
            axios.delete(`/children/${item.id}`);
        }
    };
    const SwitchMethod = (item) => {
        item.pagepermisson = item.pagepermisson === true ? false : true;
        setdataSource([...dataSource]);
        if (item.grade === 1) {
            // 补丁：只更新修改过的
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            });
        } else {
            axios.patch(`/children/${item.id}`, {
                pagepermisson: item.pagepermisson
            });
        }
        window.location.reload();
    };
    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: 5
                }}
            />
        </div>
    );
}
