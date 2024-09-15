import React, { useEffect, useState, useRef, useContext } from 'react';
import { Button, Table, Modal, Form, Input,Select} from 'antd';
import axios from 'axios';
import { ExclamationCircleOutlined } from '@ant-design/icons';
const EditableContext = React.createContext(null);
const { confirm } = Modal;
export default function NewsCategory() {
    const [dataSource, setdataSource] = useState([]);
    const [isAddvisible, setisAddvisible] = useState(false);
    
    
    
    const addForm = useRef(null)
    useEffect(() => {
        axios.get('/categories').then((res) => {
            setdataSource(res.data);
        });
    }, []);
    const handleSave = (record) => {
        setdataSource(dataSource.map(item=>{
            if (item.id === record.id) {
                return {
                    id: item.id,
                    title: record.title,
                    value: record.title
                };
            }
            return item;
        }))
        axios.patch(`/categories/${record.id}`,{
            title:record.title,
            value:record.title
        })
    };
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>;
            }
        },
        {
            title: '栏目名称',
            dataIndex: 'title',
            onCell: (record) => ({
                record,
                editable: true,
                dataIndex: 'title',
                title: '栏目名称',
                handleSave: handleSave
            })
        },
        {
            title: '操作',
            render: (item) => {
                return (
                    <div>
                        <Button
                            type="danger"
                            onClick={() => {
                                confirmMethod(item);
                            }}
                        >
                            删除
                        </Button>
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
        if (item.grade === 1) {
            //这个地方的datasource并没有改变，页面可以渲染更新是因为setdatasource（）里面的内容是过滤出来的内容，和下面不一样
            setdataSource(dataSource.filter((data) => data.id !== item.id));
            axios.delete(`/rights/${item.id}`);
        } else {
            // dataSource.filter()只能保证一层（一级没有什么影响）不发生改变，datasource并没有发生改变，所以要重新渲染页面的时候需要展开
            setdataSource([...dataSource]);
            axios.delete(`/categories/${item.id}`);
        }
    };
    const EditableRow = ({ index, ...props }) => {
        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
                <EditableContext.Provider value={form}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef(null);
        const form = useContext(EditableContext);
        useEffect(() => {
            if (editing) {
                inputRef.current.focus();
            }
        }, [editing]);
        const toggleEdit = () => {
            setEditing(!editing);
            form.setFieldsValue({
                [dataIndex]: record[dataIndex]
            });
        };
        const save = async () => {
            try {
                const values = await form.validateFields();
                toggleEdit();
                handleSave({
                    ...record,
                    ...values
                });
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        };
        let childNode = children;
        if (editable) {
            childNode = editing ? (
                <Form.Item
                    style={{
                        margin: 0
                    }}
                    name={dataIndex}
                    rules={[
                        {
                            required: true,
                            message: `${title} is required.`
                        }
                    ]}
                >
                    <Input ref={inputRef} onPressEnter={save} onBlur={save} />
                </Form.Item>
            ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{
                        paddingRight: 24
                    }}
                    onClick={toggleEdit}
                >
                    {children}
                </div>
            );
        }
        return <td {...restProps}>{childNode}</td>;
    };
    const addFormOK=()=>{
        addForm.current
        .validateFields().then(res=>{
            if(res.title){
                // 增加新闻分类
                axios.post('/categories',{
                    title:res.title,
                    value:res.title
                }).then(res=>{
                    setisAddvisible(false)
                    // 重置
                    addForm.current.resetFields();
                    setdataSource([...dataSource,{...res.data}]);
                }).catch(err=>{
                    console.log(err)
                })
            }else{
                alert('请将栏目名称填写成功后再进行提交');
            }
        }).catch(err => {
            console.log(err)
          }) 
    }
    return (
        <div>
            <Button key={6} className='ant-btn ant-btn-primary' onClick={()=>{setisAddvisible(true)}}>增加新闻分类</Button>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: 5
                }}
                rowKey={(item) => item.id}
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell
                    }
                }}
            />
            <Modal
      visible={isAddvisible}
      title="添加用户"
      okText="确定"
      cancelText="取消"
        onCancel={() => {
          setisAddvisible(false)
          // setisAddDisabled(!isAddDisabled)
      }}
      onOk={() => addFormOK()}m
      >
        <Form
        layout="vertical"
        ref={addForm}
      >
        <Form.Item
          name="title"
          label="栏目名称"
          rules={[
            {
              required: true,
              message: '请输入栏目名称',
            },
          ]}
        >
          <Input/>
        </Form.Item>
      </Form>
      </Modal>
        </div>
    );
}
