import React, { useState } from 'react';
import './navbar.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
const [menuOpen, setMenuOpen] = useState(false);
const [languageModalOpen, setLanguageModalOpen] = useState(false);
const { language, setLanguage, languages, t } = useLanguage();

const closeMenu = () => setMenuOpen(false);

const handleLanguageSelect = (nextLanguage) => {
   setLanguage(nextLanguage);
   setLanguageModalOpen(false);
   closeMenu();
};

return (
   <>
     <nav className="nav-container" aria-label="Main navigation">
       <Link to="/" className="brand-wrap" aria-label="Home" onClick={closeMenu}>
         <div className="image-container">
           <img src={logo} alt="Career Compass logo" />
         </div>
         <div className="brand-copy">
           <span className="brand-name">Career Compass</span>
           <small>Assessment Portal</small>
         </div>
       </Link>

       <button
         type="button"
         className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
         aria-label="Toggle navigation menu"
         aria-expanded={menuOpen}
         onClick={() => setMenuOpen(!menuOpen)}
       >
         {menuOpen ? (
           <svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M6 6L18 18M18 6L6 18" />
           </svg>
         ) : (
           <svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M3 7H21M3 12H21M3 17H21" />
           </svg>
         )}
       </button>

       <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
         <ul className="ul1">
           <li>
             <Link to="/" onClick={closeMenu}>{t('nav.home')}</Link>
           </li>

           <li>
             <Link to="/about-assessment" onClick={closeMenu}>{t('nav.about')}</Link>
           </li>

           <li>
             <Link to="/test" onClick={closeMenu}>{t('nav.assessment')}</Link>
           </li>

           <li className="language-item">
             <button
               type="button"
               className="language-trigger"
               onClick={() => setLanguageModalOpen(true)}
             >
               {t('nav.language')}
             </button>
           </li>
         </ul>

         <ul className="ul2">
           <li className="login-li">
             <Link to="/login" onClick={closeMenu}>{t('nav.login')}</Link>
           </li>

           <li className="reg-li">
             <Link to="/registration" onClick={closeMenu}>{t('nav.signUp')}</Link>
           </li>

           <li className="admin-li">
             <Link to="/admin" onClick={closeMenu}>{t('nav.admin')}</Link>
           </li>
         </ul>
       </div>
     </nav>

     {languageModalOpen && (
       <div className="language-modal-backdrop" onClick={() => setLanguageModalOpen(false)}>
         <div className="language-modal" onClick={(event) => event.stopPropagation()}>
           <div className="language-modal-header">
             <h3>{t('modal.title')}</h3>
             <button type="button" onClick={() => setLanguageModalOpen(false)}>
               {t('modal.close')}
             </button>
           </div>

           <div className="language-list">
             {languages.map((option) => (
               <button
                 key={option.code}
                 type="button"
                 className={`language-option ${language === option.code ? 'selected' : ''}`}
                 onClick={() => handleLanguageSelect(option.code)}
               >
                 <span>{option.native}</span>
                 <small>{option.label}</small>
               </button>
             ))}
           </div>
         </div>
       </div>
     )}
   </>
);
}

