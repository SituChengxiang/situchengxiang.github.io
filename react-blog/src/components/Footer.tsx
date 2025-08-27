import React from 'react';
import { blogConfig } from '../config/blog';
import './Footer.css';

const Footer: React.FC = () => {
  const buildYear = new Date(parseInt(blogConfig.buildTime) * 1000).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsRunning = currentYear - buildYear;

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-info">
          <span className="site-footer-owner">
            Originate from <a href="https://atlinker.cn" target="_blank" rel="noopener noreferrer">link</a>.
          </span>
          <span className="site-footer-credits">
            This page was made by <a href="https://github.com/link9596/hydrogen/" target="_blank" rel="noopener noreferrer">H₂</a>.
          </span>
        </div>
        
        <div className="site-time">
          <span>本站已运行 {yearsRunning > 0 ? `${yearsRunning} 年` : '不到一年'}</span>
          <br />
          <span>© {buildYear}{currentYear > buildYear ? ` - ${currentYear}` : ''} {blogConfig.author}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
