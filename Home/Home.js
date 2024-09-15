import React, { useEffect, useRef, useState } from 'react';
import photo from './images/photo.webp'; 
import axios from 'axios';
import { Card, Col, Row, List, Avatar, Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import _ from 'lodash';
import './Home.css';
const { Meta } = Card;
export default function Home() {
    const [viewList, setViewList] = useState([]);
    const [starList, setStarList] = useState([]);
    const [allList, setAllList] = useState([]);
    const barRef = useRef();
    const [visible, setvisible] = useState(false);
    const pieRef = useRef();
    const [pieChart, setpieChart] = useState(null);
    useEffect(() => {
        axios.get('/news?publishState=2&_limit=6&_sort=publishTime&_order=desc').then((res) => {
            setViewList(res.data);
        });
        axios.get('/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6').then((res) => {
            setStarList(res.data);
        });
    }, []);
    useEffect(() => {
        axios.get('/news?publishState=2&_expand=category').then((res) => {
            renderEcharts(_.groupBy(res.data, (item) => item.category.title));
            setAllList(res.data);
        });
        return () => {
            window.onresize = null;
        };
    }, []);
    const renderEcharts = (obj) => {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(barRef.current);

        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '分类图示'
            },
            tooltip: {},
            legend: {
                data: ['数量']
            },
            xAxis: {
                data: Object.keys(obj),
                axisLabel: {
                    rotate: '45'
                }
            },
            yAxis: {
                minInterval: 1
            },
            series: [
                {
                    name: '数量',
                    type: 'bar',
                    data: Object.values(obj).map((item) => item.length),
                    itemStyle: {
                        normal: {
                            //这里是颜色
                            color: function(params) {
                                //注意，如果颜色太少的话，后面颜色不会自动循环，最好多定义几个颜色
                                var colorList = ['#00A3E0','#FFA100', '#ffc0cb', '#CCCCCC', '#BBFFAA','#749f83', '#ca8622'];
                                return colorList[params.dataIndex]
                            }
                        }
                    }
                }
            ],
            
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        window.onresize = () => {
            myChart.resize();
        };
    };
    const {
        username,
        region,
        role: { roleName }
    } = JSON.parse(localStorage.getItem('token'));
    // 饼状图
    const renderPreView = (obj) => {
        var currentList = allList.filter((item) => item.author === username);
        var groupObj = _.groupBy(currentList, (item) => item.category.title);
        var list = [];
        for (var i in groupObj) {
            list.push({
                name: i,
                value: groupObj[i].length
            });
        }
        var myChart;
        if (!pieChart) {
            myChart = echarts.init(pieRef.current);
            setpieChart(myChart);
        } else {
            myChart = pieChart;
        }

        var option;
        option = {
            // title:{
            //     // text:'当前用户新闻分类图示',
            //     left:'center'
            // },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'center'
            },
            series: [
                {
                    name: '发布数量',
                    radius: '50%',
                    type: 'pie',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0,0,0,0.5)'
                        }
                    }
                }
            ]
        };
        option && myChart.setOption(option);
    //     var myChart = echarts.init(pieRef.current);
    //     var option = {
    //         title: {
    //           text: 'Referer of a Website',
    //           subtext: 'Fake Data',
    //           left: 'center'
    //         },
    //         tooltip: {
    //           trigger: 'item'
    //         },
    //         legend: {
    //           orient: 'vertical',
    //           left: 'left'
    //         },
    //         series: [
    //           {
    //             name: 'Access From',
    //             type: 'pie',
    //             radius: '50%',
    //             data: [
    //               { value: 1048, name: 'Search Engine' },
    //               { value: 735, name: 'Direct' },
    //               { value: 580, name: 'Email' },
    //               { value: 484, name: 'Union Ads' },
    //               { value: 300, name: 'Video Ads' }
    //             ],
    //             emphasis: {
    //               itemStyle: {
    //                 shadowBlur: 10,
    //                 shadowOffsetX: 0,
    //                 shadowColor: 'rgba(0, 0, 0, 0.5)'
    //               }
    //             }
    //           }
    //         ]
    //       };
    //       option && myChart.setOption(option);
    };
    return (
        <div>
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="最新数据集" bordered={true}>
                        <List
                            bordered
                            dataSource={viewList}
                            renderItem={(item) => (
                                <List.Item>
                                    <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="访问量最多" bordered={true}>
                        <List
                            size="small"
                            bordered
                            dataSource={starList}
                            renderItem={(item) => (
                                <List.Item>
                                    <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        cover={<img alt="example" src={photo} />}
                        actions={[
                            <SettingOutlined
                                key="setting"
                                onClick={() =>
                                    setTimeout(() => {
                                        setvisible(true);
                                        renderPreView();
                                    }, 0)
                                }
                            />
                            // <EditOutlined key="edit" />,
                            // <EllipsisOutlined key="ellipsis" />
                        ]}
                    >
                        <h2>欢迎登录全球新闻管理系统</h2>
                        <h3>Welcome to the Global News Management System</h3>
                        <Meta
                            avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : '全球'}</b>
                                    <span
                                        style={{
                                            paddingLeft: '30px'
                                        }}
                                    >
                                        {roleName}
                                    </span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>
            {/* 抽屉  */}
            <Drawer
                width="500px"
                title="个人新闻分类"
                placement="right"
                closable={true}
                onClose={() => {
                    setvisible(false);
                }}
                visible={visible}
            >
                <div
                    // id="main"
                    ref={pieRef}
                    style={{
                        width: '100%',
                        height: '400px',
                        marginTop: '30px'
                    }}
                ></div>
            </Drawer>
            <div
                id="main"
                ref={barRef}
                style={{
                    width: '100%',
                    height: '400px',
                    marginTop: '30px'
                }}
            ></div>
        </div>
    );
}
