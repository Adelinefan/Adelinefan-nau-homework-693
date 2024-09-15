import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader } from '@ant-design/pro-layout';
import { Descriptions } from 'antd';
import moment from 'moment';
import './NewsPreview.css';
export default function NewsPreview(props) {
    const [newsInfo, setNewsInfo] = useState(null);
    useEffect(() => {
        var id = props.match.params.id;
        axios.get(`/news/${id}?_expand=category?_expand=role`).then((res) => {
            setNewsInfo(res.data);
            axios.patch(`/news/${id}?_expand=category?_expand=role`,{
                view:res.data.view+1
            })
        });
    }, []);
    console.log(newsInfo)
    const auditStateList = ['未审核', '审核中', '已通过', '未通过'];
    const publishStateList = ['未发布', '待发布', '已上线', '以下线'];
    return (
        <div>
            {newsInfo && (
                <div>
                    <PageHeader
                        onBack={() => window.history.back()}
                        title={newsInfo.title}
                        // subTitle={newsInfo.category.title}
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfo.author}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{moment(newsInfo.createTime).format('YYYY/MM/DD hh-mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="发布时间">
                                {newsInfo.publishTime ? moment(newsInfo.createTime).format('YYYY/MM/DD hh-mm:ss') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="区域">{newsInfo.region}</Descriptions.Item>
                            <Descriptions.Item label="审核状态">
                                <span style={{ color: 'red' }}>{auditStateList[newsInfo.auditState]}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="发布状态">
                                <span style={{ color: 'red' }}>{publishStateList[newsInfo.publishState]}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="访问数量">
                                <span style={{ color: 'blue' }}>{newsInfo.view}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="点赞数量">
                                <span style={{ color: 'blue' }}>{newsInfo.star}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="评论数量">
                                <span style={{ color: 'blue' }}>1111111111</span>
                            </Descriptions.Item>
                        </Descriptions>
                    </PageHeader>
                    <div className="NewsPreviewContent" dangerouslySetInnerHTML={{ __html: newsInfo.content }}></div>
                </div>
            )}
        </div>
    );
}
