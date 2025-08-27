import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { blogConfig } from '../config/blog';
import './Header.css';

const Header: React.FC = () => {
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <header className="site-header" style={{ backgroundColor: blogConfig.themeColor }}>
      <nav className="navbar">
        <div className="nav-container">
          {/* 博客标题 */}
          <div className="site-title">
            <Link to="/" className="title-link">
              {isHidden ? blogConfig.hideText : blogConfig.title}
            </Link>
            <button 
              className="hide-toggle"
              onClick={toggleVisibility}
              title={isHidden ? "显示" : "隐藏"}
            >
              {isHidden ? "👀" : "🙈"}
            </button>
          </div>

          {/* 导航菜单 */}
          <div className="nav-menu">
            {blogConfig.headerPages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className={`nav-link ${location.pathname === page.path ? 'active' : ''}`}
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
