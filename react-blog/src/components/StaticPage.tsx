import React from 'react';
import ReactMarkdown from 'react-markdown';
import './StaticPage.css';

interface StaticPageProps {
  title: string;
  tagline?: string;
  content: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ title, tagline, content }) => {
  return (
    <div className="static-page">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
        {tagline && <p className="page-tagline">{tagline}</p>}
      </header>
      
      <div className="page-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default StaticPage;
