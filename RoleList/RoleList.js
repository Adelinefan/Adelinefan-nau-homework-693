import React, { useState, useEffect } from 'react';
import { Button, Table, Popover, Switch, Modal, Tree } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
export default function RoleList() {
    const [dataSource, setdataSource] = useState([]);
    const [isModalVisible, setisModalVisible] = useState(false);
    const [rightList, setRightList] = useState([]);
    const [currentRights, setcurrentRights] = useState([]);
    const [currentId, setcurrentId] = useState(0);
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>;
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName'
        },
        {
            title: '操作',
            render: (item) => {
                return (
                    <div>
                        {/* <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)}></Button> */}
                        <Popover
                            content={
                                <div style={{ textAlign: 'center' }}>
                                    <Switch checked={item.pagepermisson}></Switch>
                                </div>
                            }
                            title="页面配置项"
                            trigger={item.pagepermisson === undefined ? '' : 'click'}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setisModalVisible(true);
                                    setcurrentRights(item.rights);
                                    setcurrentId(item.id);
                                }}
                            ></Button>
                        </Popover>
                    </div>
                );
            }
        }
    ];
    // const treeData = []
    const onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const onCheck = (checkedKeys) => {
        setcurrentRights(checkedKeys.checked);
    };
    useEffect(() => {
        axios('/roles').then((res) => {
            setdataSource(res.data);
        });
        axios(`/rights?_embed=children`).then((res) => {
            setRightList(res.data);
        });
    }, []);
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
        axios.delete(`/roles/${item.id}`);
    };
    const handleOk = () => {
        setisModalVisible(false);
        setdataSource(
            dataSource.map((item) => {
                if (item.id === currentId) {
                    return {
                        ...item,
                        rights: currentRights
                    };
                }
                return item;
            })
        );
        axios.patch(`/roles/${currentId}`, {
            rights: currentRights
        });
    };
    const handleCancel = () => {
        setisModalVisible(false);
    };
    return (
        <div>
            <Table dataSource={dataSource} columns={columns} rowKey={(item) => item.id}></Table>
            <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Tree
                    checkable
                    // 默认展开
                    // defaultExpandedKeys={['0-0-0', '0-0-1']}
                    // 默认选中(变蓝色)
                    // defaultSelectedKeys={['0-0-0', '0-0-1']}
                    // 默认打对勾
                    defaultCheckedKeys={currentRights}
                    onSelect={onSelect}
                    checkStrictly={true}
                    onCheck={onCheck}
                    treeData={rightList}
                />
            </Modal>
        </div>
    );
}
