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

  const onSubmit = (data) => {
    console.log("Login Data:", data);

    // Send data to your backend here
    // Example:
    // axios.post("/api/login", data)
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