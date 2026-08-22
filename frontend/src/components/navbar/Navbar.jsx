import React from 'react'
import "./navbar.css"
import logo from "../../assets/logo.png"
import { Link } from "react-router-dom";

export default function Navbar(){
  return (

<>
   <div className="nav-container">

      <div className='image-container'>
        <img src={logo} alt="logo" />
      </div>
       
       <ul className='ul1'>
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/about-assessment">
            About the Assessment
          </Link>
        </li>

        <li>
          <Link to="/test">
            Assessment
          </Link>
        </li>
        <li>Language</li>
       </ul>

       <ul className='ul2' >
        <li className='login-li'>
          <Link to="/login">
            Login
          </Link>
        </li>
         <li className='reg-li'>
          <Link to="/registration">
           Registration
          </Link>
        </li>

        <li className='admin-li'>
          <Link to="/admin">
            Login as Admin
          </Link>
        </li>
       </ul>
   </div>
</>

  )
}

