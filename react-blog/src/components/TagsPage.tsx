import React from 'react';
import { Link } from 'react-router-dom';
import { getAllTags, getPostsByTag, formatDate } from '../utils/blogUtils';
import './TagsPage.css';

interface TagsPageProps {
  selectedTag?: string;
}

const TagsPage: React.FC<TagsPageProps> = ({ selectedTag }) => {
  const allTags = getAllTags();
  const taggedPosts = selectedTag ? getPostsByTag(selectedTag) : [];

  if (selectedTag) {
    return (
      <div className="tags-page">
        <header className="tags-header">
          <h1>标签: #{selectedTag}</h1>
          <Link to="/tags" className="back-to-tags">← 返回所有标签</Link>
        </header>
        
        <div className="tagged-posts">
          {taggedPosts.map((post) => (
            <article key={post.slug} className="tagged-post">
              <h3 className="post-title">
                <Link to={`/post/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <div className="post-meta">
                {formatDate(post.date)}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tags-page">
      <header className="tags-header">
        <h1>Tags</h1>
        <p>（ • ̀ω•́ ） 这里竟然是标签哎！</p>
      </header>
      
      <div className="tags-list">
        {Object.entries(allTags).map(([tag, count]) => (
          <div key={tag} className="tag-section">
            <h2 id={tag} className="tag-title">
              #{tag}
            </h2>
            <div className="tag-info">
              <Link to={`/tag/${tag}`} className="tag-link">
                {count} 篇文章
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
