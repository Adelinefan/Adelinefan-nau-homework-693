import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Home from './Home/Home';
import UserList from './UserList/UserList';
import RoleList from './RoleList/RoleList';
import RightList from './RightList/RightList';
import NoPermission from './NoPermission/NoPermission';
import NewsAdd from '../Newssanbox/NewsManage/NewsAdd/NewsAdd';
import NewsDraft from '../Newssanbox/NewsManage/NewsDraft';
import NewsCategory from '../Newssanbox/NewsManage/NewsCategory';
import NewsPreview from './NewsManage/NewsPreview/NewsPreview';
import NewsUpdate from './NewsManage/NewsUpdate/NewsUpdate';
import Audit from '../Newssanbox/AuditManage/Audit';
import AuditList from '../Newssanbox/AuditManage/AuditList';
import Unpublished from './PublishManage/Unpublished';
import Published from './PublishManage/Published';
import Sunset from './PublishManage/Sunset';
import axios from 'axios';
import { Spin } from 'antd';
import { connect } from 'react-redux';
const LocalRouterMap = {
    '/home': Home,
    '/user-manage/list': UserList,
    '/right-manage/role/list': RoleList,
    '/right-manage/right/list': RightList,
    '/news-manage/add': NewsAdd,
    '/news-manage/draft': NewsDraft,
    '/news-manage/category': NewsCategory,
    '/news-manage/preview/:id': NewsPreview,
    '/news-manage/update/:id': NewsUpdate,
    '/audit-manage/audit': Audit,
    '/audit-manage/list': AuditList,
    '/publish-manage/unpublished': Unpublished,
    '/publish-manage/published': Published,
    '/publish-manage/sunset': Sunset
};
function NewsRouter(props) {
    const [BackRouteList, setBackRouteList] = useState([]);
    useEffect(() => {
        Promise.all([axios.get('/rights'), axios.get('/children')]).then((res) => {
            setBackRouteList([...res[0].data, ...res[1].data]);
        });
    }, []);
    // 权限是否关闭
    const checkRoute = (item) => {
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson);
    };
    // 当前用户是否有资格进行查看页面
    const {
        role: { rights }
    } = JSON.parse(localStorage.getItem('token'));
    const checkUserPermission = (item) => {
        return rights.includes(item.key);
    };
    return (
        <div>
            {/* 使用redux来进行状态管理控制页面是否处于加载中 */}
            <Spin size="large" spinning={props.isLoading}>
                <Switch>
                    {BackRouteList.map((item) => {
                        if (checkRoute(item) && checkUserPermission(item)) {
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact />;
                        }
                        return null;
                    })}
                    <Redirect from="/" to="/home" exact />
                    {BackRouteList > 0 && <Route path="*" component={NoPermission} />}
                </Switch>
            </Spin>
        </div>
    );
}
const mapStateTopProps = ({ LoadingReducer: { isLoading } }) => ({
    isLoading
});
const mapDispatchToprops = {
    changeCollapsed() {
        return {
            type: 'change_loading'
        };
    }
};
export default connect(mapStateTopProps, mapDispatchToprops)(NewsRouter);
