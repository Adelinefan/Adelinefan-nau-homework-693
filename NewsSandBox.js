import React, { useEffect } from 'react'
import SideMenu from '../../components/SideMenu/SideMenu'
import TopHeader from '../../components/TopHeader/TopHeader'
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout'
import './NewsSandBox.css'
import NewsRouter from './NewsRouter';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
export default function NewsSandBox() {
  NProgress.start()
  useEffect(() => {
    NProgress.done()
  })
  return (
    <Layout>
      <SideMenu></SideMenu>
      <Layout className="site-layout">
        <TopHeader></TopHeader>
        <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              overflow: "auto"
            }}
          >
      <NewsRouter></NewsRouter>
          </Content>
        </Layout>
    </Layout>
  )
}
