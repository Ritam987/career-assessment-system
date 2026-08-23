import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainHome from './pages/Homepage/MainHome';
import Userdashboard from './pages/Userpage/Userdashboard';
import Login from './pages/Loginpage/Login';
import Registaration from './pages/Registrationpage/Registaration';
import ReportPage from './pages/Resultpage/Report_page_after_test';
import Admindashboard from './pages/Adminpage/Admindashboard';
import Navbar from './components/navbar/Navbar';
import Aboutassesment from './pages/aboutassesment/Aboutassesment';
import Testpage from './pages/Testpage/Testpage';
import Adminlogin from './pages/Loginpage/Adminlogin';
import { LanguageProvider } from './context/LanguageContext';

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<MainHome />} />

          <Route path="/about-assessment" element={<Aboutassesment />} />

          <Route path="/login" element={<Login />} />

          <Route path="/registration" element={<Registaration />} />

          <Route path="/dashboard" element={<Userdashboard />} />

          <Route path="/test" element={<Testpage />} />

          <Route path="/report" element={<ReportPage />} />

          <Route path="/admin" element={<Adminlogin />} />

          <Route path="/admin-dashboard" element={<Admindashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
