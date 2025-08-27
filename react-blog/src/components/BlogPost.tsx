import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { Post } from '../types/blog';
import { getPostBySlug, formatDate } from '../utils/blogUtils';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <div className="blog-post">
        <div className="post-not-found">
          <h1>文章未找到</h1>
          <p>抱歉，您要查看的文章不存在。</p>
          <Link to="/" className="back-link">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="blog-post">
      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <time dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          {post.author && (
            <span className="post-author"> • {post.author}</span>
          )}
        </div>
      </header>

      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <Link 
              key={tag} 
              to={`/tag/${tag}`} 
              className="tag-link"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <footer className="post-footer">
        <Link to="/" className="back-link">← 返回首页</Link>
      </footer>
    </article>
  );
};

export default BlogPost;
