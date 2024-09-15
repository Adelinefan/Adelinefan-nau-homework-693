// 自定义hooks
import { useEffect, useState } from 'react';
import axios from 'axios';
import { notification } from 'antd';
function UsePublish(number) {
    const { username } = JSON.parse(localStorage.getItem('token'));
    const [dataSource, setdataSource] = useState([]);
    useEffect(() => {
        axios(`/news?author=${username}&publishState=${number}&_expand=category`).then((res) => {
            setdataSource(res.data);
        });
    }, []);
    const handlePublish = (id) => {
        setdataSource(dataSource.filter((item) => item.id !== id));
        axios
            .patch(`/news/${id}`, {
                publishState: 2,
                publishTime: Date.now()
            })
            .then((res) => {
                notification.open({
                    message: '提醒框',
                    description: `您可以到发布管理中已发布中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    const handleRemove = (id) => {
        setdataSource(dataSource.filter((item) => item.id !== id));
        axios
            .patch(`/news/${id}`, {
                publishState: 3,
                publishTime: Date.now()
            })
            .then((res) => {
                notification.open({
                    message: '提醒框',
                    description: `您可以到发布管理中已下线中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    const handleDelete = (id) => {
        setdataSource(dataSource.filter((item) => item.id !== id));
        axios.delete(`/news/${id}`).then((res) => {
            notification.open({
                message: '提醒框',
                description: `您已经删除本条新闻`,
                placement: 'bottomRight'
            });
        });
    };
    return {
        dataSource,
        handlePublish,
        handleRemove,
        handleDelete
    };
}
export default UsePublish;
