import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./adminlogin.css"
import { useNavigate } from "react-router-dom";

const Adminlogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 const onSubmit = async (data) => {
    try {
      console.log("Sending Admin Login Data:", data);

      // request to the backend for admin login
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // if your backend expects the identifier to be named differently (like "email" or "username"), you should map it accordingly. For now, I'm sending it as is:
        body: JSON.stringify({
          email: data.identifier, 
          password: data.password
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Admin Login Successful!");
        
        // Save the token and admin data in localStorage
        localStorage.setItem("adminToken", responseData.token);
        if(responseData.admin) {
            localStorage.setItem("adminData", JSON.stringify(responseData.admin));
        }

        // Navigate to the admin dashboard or any other page after successful login
        navigate("/admin-dashboard"); 
      } else {
        alert(`Login Failed: ${responseData.message || 'Invalid admin credentials'}`);
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      alert("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Heading */}
        <div className="login-heading">
          <h2>Welcome back Admin!</h2>
          <p>Login to the Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Mobile / Email */}
          <div className="form-group">
            <label htmlFor="identifier">
              Mobile number or Email
            </label>

            <div className="input-wrapper">
              <span className="input-icon">👤</span>

              <input
                id="identifier"
                type="text"
                placeholder="Enter mobile number or email"
                {...register("identifier", {
                  required: "Mobile number or email is required",
                })}
              />
            </div>

            {errors.identifier && (
              <p className="error-message">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {errors.password && (
              <p className="error-message">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember / Forgot */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                {...register("rememberMe")}
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>
          </div>

          {/* Login */}
          <button type="submit" className="login-button">
            Login
          </button>

        </form>

        {/* Signup */}
        <div className="signup-text">
          Don't have an account?
          <button type="button"
  onClick={() => navigate("/registration")}>Sign up</button>
        </div>

      </div>
    </div>
  );
};

export default Adminlogin;