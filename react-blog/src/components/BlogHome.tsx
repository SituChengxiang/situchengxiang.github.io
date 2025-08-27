import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types/blog';
import { formatDate, truncateContent } from '../utils/blogUtils';
import './BlogHome.css';

interface BlogHomeProps {
  posts: Post[];
  stickyPosts: Post[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const BlogHome: React.FC<BlogHomeProps> = ({
  posts,
  stickyPosts,
  currentPage,
  totalPages,
  hasNext,
  hasPrev
}) => {
  return (
    <div className="blog-home">
      <div className="post-list">
        {/* 置顶文章 */}
        {currentPage === 1 && stickyPosts.map((post) => (
          <article key={post.slug} className="post-item sticky">
            <span className="post-meta">{formatDate(post.date)}</span>
            <span className="sticky-badge">置顶</span>
            <h2>
              <Link to={`/post/${post.slug}`} className="post-link" title={post.title}>
                {post.title}
              </Link>
            </h2>
            <p className="post-excerpt">{truncateContent(post.content, 30)}</p>
          </article>
        ))}

        {/* 普通文章 */}
        {posts.filter(post => !post.stickie).map((post) => (
          <article key={post.slug} className="post-item">
            <span className="post-meta">{formatDate(post.date)}</span>
            <h2>
              <Link to={`/post/${post.slug}`} className="post-link" title={post.title}>
                {post.title}
              </Link>
            </h2>
            <p className="post-excerpt">{truncateContent(post.content, 30)}</p>
          </article>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination">
          {hasPrev ? (
            <Link 
              to={currentPage === 2 ? "/" : `/page/${currentPage - 1}`} 
              className="pagination-link prev"
            >
              <img src="/theme/left.svg" alt="Previous" style={{ height: '28px' }} />
            </Link>
          ) : (
            <span className="pagination-link prev disabled">
              <img src="/theme/leftdis.svg" alt="Previous" style={{ height: '28px' }} />
            </span>
          )}

          {hasNext ? (
            <Link 
              to={`/page/${currentPage + 1}`} 
              className="pagination-link next"
            >
              <img src="/theme/right.svg" alt="Next" style={{ height: '28px' }} />
            </Link>
          ) : (
            <span className="pagination-link next disabled">
              <img src="/theme/rightdis.svg" alt="Next" style={{ height: '28px' }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogHome;
