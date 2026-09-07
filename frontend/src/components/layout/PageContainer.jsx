import React from 'react';
import './AuthLayout.css';

const PageContainer = ({ children }) => {
  return (
    <main className="main-page-container">
      <div className="container">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
