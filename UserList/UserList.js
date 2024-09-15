import React, {useState,useEffect,useRef} from 'react'
import { Button, Table, Switch, Modal } from 'antd'
import UserForm from '../../../components/user-manager/UserForm'
import axios from 'axios'
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
const { confirm } = Modal
export default function UserList() {
  const [dataSource, setdataSource] = useState([])
  const [isAddvisible, setisAddvisible] = useState(false)
  // const [isAddDisabled, setisAddDisabled] = useState(false)
  const [roleList,setroleList]=useState([])
  const [regionList, setregionList] = useState([])
  const [isUpdateVisible, setisUpdateVisible] = useState(false)
  const [isUpdateDisabled, setisUpdateDisabled] = useState(false)
  const [current, setcurrent] = useState(null);
  const addForm = useRef(null)
  const updateForm = useRef(null)
  const columns = [
    {
    title: '区域',
      dataIndex: 'region',
      filters: [
        ...regionList.map(item => ({
          text: item.title,
          value:item.value
        })),
        {
          text: "全球",
          value:"全球"
        }
      ], 
      onFilter: (value, item) => {
        if (value === "全球") {
        return item.region===""
        }
       return  item.region===value
      },
    render:(region)=> {
      return  <b>{region===""?'全球':region}</b>
     }
    },
    {
      title: '角色名称',
      dataIndex: 'role',
      filters: [
        ...roleList.map(item => ({
          text: item.roleName,
          value:item.roleName
        }))
      ], 
      onFilter: (value, item) => {
       return item.role.ro===value
      },
      render:(role)=> {
        return  <b>{role.roleName}</b>
       }
    },
    {
      title: '用户名',
      dataIndex: 'username',
      render:(username)=> {
        return  <b>{username}</b>
       }
    },
    {
      title: '用户状态',
      dataIndex: 'roleState',
      render:(roleState,item)=> {
        // 超级管理员不允许更改用户状态，同级之间不允许改变用户状态
        let userInfo=JSON.parse(localStorage.getItem('token'));
        let data=item;
        let iseditor=false;
        if(item.roleId==1){
          iseditor=true;
        }
        if(item.roleId==2&&userInfo.roleId==2){
          iseditor=true;
        }
        return  <Switch checked={roleState} disabled={iseditor} onChange={(item)=>handleChange(data)}></Switch>
       }
    },
    {
      title: '操作',
      render: (item) => {
        return <div>
          <Button danger shape="circle" icon=
            {<DeleteOutlined />} onClick={()=>confirmMethod(item)} ></Button>
          <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleUpdate(item)}></Button>  
        </div>
      }
    }
  ]
  const { roleId, region,username }=JSON.parse(localStorage.getItem("token"))
  useEffect(() => {
    const roleObj = {
      "1": "superadmin",
      "2": "admin",
      "3":"editor"
    }
    axios.get("/users?_expand=role").then(res => {
      const list=res.data
      setdataSource(roleObj[roleId] === "superadmin" ? list : [
        ...list.filter(item => item.username ===username),
      ...list.filter(item => item.region=== region&&roleObj[item.roleId]==="editor")
      ])
  })
  }, [ roleId, region,username ])
  useEffect(() => {
    axios.get("/regions").then(res => {
      const list=res.data
      setregionList(list)
  })
  }, [])
  useEffect(() => {
    axios.get("/roles").then(res => {
      const list=res.data
      setroleList(list)
  })
  }, [])
  const confirmMethod = (item) => {
    let userInfo=JSON.parse(localStorage.getItem('token'));
        if(item.roleId==1){
          alert('同级之间不允许做删除操作');
          return;
        }
        if(item.roleId==2&&userInfo.roleId==2){
          alert('同级之间不允许做删除操作');
          return;
        }
        else{
          confirm({
            title: 'Do you want to delete items?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            onOk(){
              deleteMethod(item)
            },
            onCancel() {
              console.log('Cancel')
            }
          })
        }
  }
  const deleteMethod = (item) => {
    setdataSource(dataSource.filter(data => data.id !== item.id))
      axios.delete(`/users/${item.id}`)
  }
  const addFormOK = () => {
      addForm.current.validateFields().then(value => {
      //  console.log(value)
        setisAddvisible(false)
        // 重置
        addForm.current.resetFields()
      // post到后端，生成id，再设置datasource，方便后面的删除和更新

        axios.post('/users', {
       ...value,  
       "roleState": true,
       "default": false,
        }).then(res => {
          // console.log(res.data)
          setdataSource([...dataSource, {
            ...res.data,
            // 解决角色名称第一次刷新不出来的问题
            role: roleList.filter(item => item.id === value.roleId)[0]
          }])
        })
       
      }).catch(err => {
       console.log(err)
     }) 
  }
  const handleChange = (item) => {
    item.roleState= !item.roleState
    setdataSource([...dataSource])
    axios.patch(`/users/${item.id}`, {
      roleState:item.roleState
    })
  }
  //todo
  const handleUpdate = (item) => {
    // todo:
    let userInfo=JSON.parse(localStorage.getItem('token'));
    if(userInfo.roleId==item.roleId&&userInfo.username!==item.username){
      alert('同级用户不允许修改他人的信息')
    }else{
      setTimeout(() => {
        setisUpdateVisible(true)
        if (item.roleId === 1) {
          setisUpdateDisabled(true)
        } 
        
        else {
          setisUpdateDisabled(false)
        }
        // 将原来的显示出来再进行更新
        updateForm.current.setFieldsValue(item)
      }, 0)
      setcurrent(item)
    }
    
  }
  const upDateFormOK = ()=> { 
    updateForm.current.validateFields().then(value => {
      setisUpdateVisible(false)
      // 重置
      // updateForm.current.resetFields()
      setdataSource(dataSource.map(item => {
          if (item.id === current.id) {
            return {
              ...item,
              ...value,
              role:roleList.filter(data=>data.id===value.roleId)[0]
           }
          }
          return item
      }))
      setisUpdateDisabled(!setisUpdateDisabled)
      axios.patch(`/users/${current.id}`,value)
    })
  }
  return (
    <div>
      <Button type='primary' onClick={()=>{setisAddvisible(true)}}>添加用户</Button>
      <Table dataSource={dataSource} columns={columns}
        pagination={{
          pageSize:5
      }}
        rowKey={item => item.id}></Table>
      {/* 应该匹配哪个Modal是set...联系的 */}
        <Modal
      visible={isAddvisible}
      title="添加用户"
      okText="确定"
      cancelText="取消"
        onCancel={() => {
          setisAddvisible(false)
          // setisAddDisabled(!isAddDisabled)
      }}
      onOk={() => addFormOK()}
      >
        <UserForm roleList={roleList} regionList={regionList} ref={addForm}></UserForm>
      </Modal>
      <Modal
      visible={isUpdateVisible}
      title="更新用户"
      okText="更新"
      cancelText="取消"
        onCancel={() => {
          setisUpdateVisible(false)
          setisUpdateDisabled(!isUpdateDisabled)
      }}
      onOk={() => upDateFormOK()}
      >
        <UserForm roleList={roleList} regionList={regionList} ref={updateForm} isUpdateDisabled={isUpdateDisabled} isUpdate={true}></UserForm>
    </Modal>
    </div>
  )
}
// 添加功能中是否可以选择地区再UserForm中做的状态管理
// 更新功能中的是否可以选择地区因为共用了UserForm组件，所以在UserList中做的状态管理
