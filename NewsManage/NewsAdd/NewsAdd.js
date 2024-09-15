import React, { useEffect, useState, useRef } from 'react';
import { PageHeader, Steps, Button, Form, Input, Select, message, notification } from 'antd';
import './NewsAdd.css';
import axios from 'axios';
import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
const { Step } = Steps;
const { Option } = Select;
export default function NewsAdd(props) {
    const NewsForm = useRef(null);
    const [current, setCurrent] = useState(0);
    const [editor, setEditor] = useState(null); // 存储 editor 实例
    const [html, setHtml] = useState(null); // 编辑器内容
    const [categoryList, setCategorieList] = useState([]);
    // 收集表单信息
    // category存储的是id
    const [forminfo, setformInfo] = useState({});
    // 解析出存储的数据
    const user = JSON.parse(localStorage.getItem('token'));
    const handleNext = () => {
        if (current === 0) {
            NewsForm.current
                .validateFields()
                .then((res) => {
                    setformInfo(res);
                    setCurrent(current + 1);
                })
                .catch((err) => {
                    message.error('请填写完整！');
                });
        } else {
            if (html === '' || html.trim() === '<p><br></p>') {
                message.error('新闻内容不能为空！');
            } else {
                setCurrent(current + 1);
            }
        }
    };
    const handlePrevious = () => {
        setCurrent(current - 1);
    };
    const handleSave = () => {
        axios
            .post('/news', {
                ...forminfo,
                content: html,
                region: user.region ? user.region : '全球',
                author: user.username,
                roleId: user.roleId,
                // 草稿箱：1：待审核2：审核通过3：审核不通过
                auditState: 0,
                // 默认未发布
                publishState: 0,
                createTime: Date.now(),
                star: 0,
                view: 0,
                publishTime: 0
            })
            .then((res) => {
                props.history.push('/news-manage/draft');
                notification.open({
                    message: '提醒框',
                    description: `您可以到草稿箱中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    const handleSubmit = () => {
        axios
            .post('/news', {
                ...forminfo,
                content: html,
                region: user.region ? user.region : '全球',
                author: user.username,
                roleId: user.roleId,
                // 草稿箱：1：待审核2：审核通过3：审核不通过
                auditState: 1,
                // 默认未发布
                publishState: 0,
                createTime: Date.now(),
                star: 0,
                view: 0,
                publishTime: 0
            })
            .then((res) => {
                props.history.push('/audit-manage/list');
                notification.open({
                    message: '提醒框',
                    description: `您可以到审核列表中查看您的新闻信息`,
                    placement: 'bottomRight'
                });
            });
    };
    useEffect(() => {
        axios.get('/categories').then((res) => {
            setCategorieList(res.data);
        });
    },[]);

    // 模拟 ajax 请求，异步设置 html
    useEffect(() => {
        setTimeout(() => {
            setHtml(html);
        }, 1500);
    }, []);
    const toolbarConfig = {};
    const editorConfig = {
        placeholder: '请输入内容...'
    };
    // 及时销毁 editor ，重要！
    //  useEffect(() => {
    //   return () => {
    //     if (editor == null)
    //       return editor.destroy()
    //       setEditor(null)
    //   }
    // }, [editor])
    return (
        <div>
            <PageHeader className="site-page-header" title="撰写新闻" />
            <Steps current={current}>
                <Step title="基本信息" description="新闻标题，新闻分类" />
                <Step title="新闻内容" description="新闻主题内容" />
                <Step title="新闻提交" description="保存草稿或者提交审核" />
            </Steps>
            <div className="newsadd">
                <div className={current === 0 ? '' : 'hidden'}>
                    <Form ref={NewsForm}>
                        <Form.Item
                            label="新闻标题"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: '请写上你的新闻标题!'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="新闻分类"
                            name="categoryId"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择你的新闻分类!'
                                }
                            ]}
                        >
                            <Select>
                                {categoryList.map((item) => (
                                    <Option key={item.id} value={item.id} id={item.id}>
                                        {item.title}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
                <div className={current === 1 ? '' : 'hidden'}>
                    <>
                        <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
                            <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" style={{ borderBottom: '1px solid #ccc' }} />
                            <Editor
                                defaultConfig={editorConfig}
                                value={html}
                                onCreated={setEditor}
                                onChange={(editor) => setHtml(editor.getHtml())}
                                mode="default"
                                style={{ height: '500px', overflowY: 'hidden' }}
                            />
                        </div>
                    </>
                </div>
                <div className={current === 2 ? '' : 'hidden'}>3</div>
            </div>
            <div style={{ marginTop: '20px' }}>
                {current === 2 && (
                    <span>
                        {/* 传参的话使用第一个，第二个会直接执行 */}
                        {/* <Button type="primary" onClick={()=>handleSave}>保存草稿箱</Button> */}
                        {/* <Button type="primary" onClick={handleSave()}>保存草稿箱</Button> */}
                        <Button type="primary" onClick={handleSave}>
                            保存草稿箱
                        </Button>
                        <Button danger onClick={handleSubmit}>
                            提交审核
                        </Button>
                    </span>
                )}
                {current < 2 && (
                    <Button type="primary" onClick={handleNext}>
                        下一步
                    </Button>
                )}
                {current > 0 && <Button onClick={handlePrevious}>上一步</Button>}
            </div>
        </div>
    );
}
