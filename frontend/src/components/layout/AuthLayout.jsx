import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import PageContainer from './PageContainer';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout-wrapper">
      <Sidebar />
      <PageContainer>
        {children}
      </PageContainer>
    </div>
  );
};

export default AuthLayout;
