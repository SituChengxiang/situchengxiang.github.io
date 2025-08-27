import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import BlogHome from './components/BlogHome';
import BlogPost from './components/BlogPost';
import { getAllPosts, getStickyPosts, getPaginatedPosts } from './utils/blogUtils';
import { blogConfig } from './config/blog';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="site-header">
          <div className="header-wrapper">
            <h1 className="site-title">
              <a href="/">{blogConfig.title}</a>
            </h1>
            <nav className="site-nav">
              {blogConfig.headerPages.map((page) => (
                <a key={page.path} href={page.path} className="page-link">
                  {page.title}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="page-content" style={{ backgroundImage: `url(${blogConfig.background})` }}>
          <div className="wrapper">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/post/:slug" element={<BlogPost />} />
              <Route path="/page/:pageNum" element={<PageRoute />} />
            </Routes>
          </div>
        </main>

        <footer className="site-footer">
          <span className="site-footer-owner">Originate from <a href="https://atlinker.cn">link</a>.</span>
          <span className="site-footer-credits">This page was made by <a href="https://github.com/link9596/hydrogen/"> H₂</a>.</span>
        </footer>
      </div>
    </Router>
  );
}

// 首页路由组件
function HomeRoute() {
  const paginatedData = getPaginatedPosts(1);
  const stickyPosts = getStickyPosts();

  return (
    <BlogHome 
      posts={paginatedData.posts}
      stickyPosts={stickyPosts}
      currentPage={paginatedData.currentPage}
      totalPages={paginatedData.totalPages}
      hasNext={paginatedData.hasNext}
      hasPrev={paginatedData.hasPrev}
    />
  );
}

// 分页路由组件
function PageRoute() {
  const { pageNum } = useParams<{ pageNum: string }>();
  const page = parseInt(pageNum || '1', 10);
  const paginatedData = getPaginatedPosts(page);
  const stickyPosts = page === 1 ? getStickyPosts() : [];

  return (
    <BlogHome 
      posts={paginatedData.posts}
      stickyPosts={stickyPosts}
      currentPage={paginatedData.currentPage}
      totalPages={paginatedData.totalPages}
      hasNext={paginatedData.hasNext}
      hasPrev={paginatedData.hasPrev}
    />
  );
}

export default App;
