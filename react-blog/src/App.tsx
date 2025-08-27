import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogHome from './components/BlogHome';
import BlogPost from './components/BlogPost';
import TagsPage from './components/TagsPage';
import StaticPage from './components/StaticPage';
import { getPaginatedPosts, getStickyPosts } from './utils/blogUtils';
import { blogConfig } from './config/blog';
import './App.css';

// 页面内容（模拟数据，实际应用中可以从文件系统或API获取）
const pageContents = {
  about: `## #主题作者

感谢 [Link](https://github.com/link9596) 制作了这么好看的主题

## #网站拥有者

我是 ${blogConfig.author}，一个热爱编程和写作的人。

欢迎访问我的博客！这里记录了我的学习心得、生活感悟和技术分享。

## #联系方式

- GitHub: [SituChengxiang](https://github.com/SituChengxiang)
- 博客: [${blogConfig.url}](https://${blogConfig.url})`,

  hydrogen: `# Hydrogen

A clean, responsive Jekyll theme for bloggers.

## #快速开始

这是一个基于 Jekyll 的简洁博客主题，现在已经迁移到 React。

### 特性

- 响应式设计
- 支持标签分类
- 支持文章置顶
- 简洁美观的界面
- 支持数学公式渲染

### 配置

博客的配置信息在 \`src/config/blog.ts\` 文件中，您可以根据需要进行修改。`,

  links: `这里是友情链接页面。

您可以在这里添加您的朋友们的博客链接。`,

  billboard: `# 公告板

欢迎来到我的博客！

这里会发布一些重要的公告和通知。`
};

// 首页组件
const HomePage: React.FC = () => {
  const paginationInfo = getPaginatedPosts(1);
  const stickyPosts = getStickyPosts();

  return (
    <BlogHome
      posts={paginationInfo.posts}
      stickyPosts={stickyPosts}
      currentPage={paginationInfo.currentPage}
      totalPages={paginationInfo.totalPages}
      hasNext={paginationInfo.hasNext}
      hasPrev={paginationInfo.hasPrev}
    />
  );
};

// 分页组件
const PageRoute: React.FC = () => {
  const { pageNum } = useParams<{ pageNum: string }>();
  const page = parseInt(pageNum || '1');
  const paginationInfo = getPaginatedPosts(page);

  return (
    <BlogHome
      posts={paginationInfo.posts}
      stickyPosts={[]}
      currentPage={paginationInfo.currentPage}
      totalPages={paginationInfo.totalPages}
      hasNext={paginationInfo.hasNext}
      hasPrev={paginationInfo.hasPrev}
    />
  );
};

// 标签路由组件
const TagRoute: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  return <TagsPage selectedTag={tag} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        
        <main className="main-content fade">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/page/:pageNum" element={<PageRoute />} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tag/:tag" element={<TagRoute />} />
            <Route 
              path="/about" 
              element={
                <StaticPage 
                  title="About" 
                  tagline="关于这个主题的作者和这个网站的拥有者 ~" 
                  content={pageContents.about} 
                />
              } 
            />
            <Route 
              path="/hydrogen" 
              element={
                <StaticPage 
                  title="Hydrogen" 
                  content={pageContents.hydrogen} 
                />
              } 
            />
            <Route 
              path="/links" 
              element={
                <StaticPage 
                  title="Links" 
                  tagline="My friends." 
                  content={pageContents.links} 
                />
              } 
            />
            <Route 
              path="/billboard" 
              element={
                <StaticPage 
                  title="Billboard" 
                  content={pageContents.billboard} 
                />
              } 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
