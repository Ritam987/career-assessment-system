import { useForm } from "react-hook-form";
import "./Registration.css";

function Registration() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      gender: "",
      email: "",
      password: "",
      phone: "",
      dob: "",
      age: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const dob = watch("dob");
  const age = watch("age");

  const calculateAge = (dobValue) => {
    if (!dobValue) {
      setValue("age", "");
      return;
    }

    const birthDate = new Date(dobValue);
    const today = new Date();

    let calculatedAge =
      today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    setValue("age", calculatedAge);
  };

  const onSubmit = async (data) => {
    try {
      console.log("Registration data:", data);

      // Send data to your backend here.
      /*
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      */

      alert("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">

        <div className="registration-header">
          <h1>Registration</h1>
          <p>Please fill in your details</p>
        </div>

        <form
          className="registration-form"
          onSubmit={handleSubmit(onSubmit)}
        >

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span>*</span>
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must contain at least 2 characters",
                },
                maxLength: {
                  value: 55,
                  message: "Name cannot exceed 55 characters",
                },
                pattern: {
                  value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                  message:
                    "Name can contain only letters and spaces",
                },
              })}
            />

            {errors.name && (
              <p className="field-error">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="gender">
              Gender <span>*</span>
            </label>

            <select
              id="gender"
              {...register("gender", {
                required: "Please select your gender",
              })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {errors.gender && (
              <p className="field-error">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email <span>*</span>
            </label>

            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />

            {errors.email && (
              <p className="field-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span>*</span>
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter a strong password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message:
                    "Password must contain at least 8 characters",
                },
                maxLength: {
                  value: 128,
                  message:
                    "Password cannot exceed 128 characters",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character",
                },
              })}
            />

            {errors.password && (
              <p className="field-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span>*</span>
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="10 digit phone number"
              maxLength={10}
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message:
                    "Enter a valid 10-digit Indian phone number",
                },
              })}
            />

            {errors.phone && (
              <p className="field-error">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* DOB + Age */}
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="dob">
                Date of Birth <span>*</span>
              </label>

              <input
                id="dob"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("dob", {
                  required: "Date of birth is required",
                  onChange: (e) =>
                    calculateAge(e.target.value),
                })}
              />

              {errors.dob && (
                <p className="field-error">
                  {errors.dob.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="age">
                Age
              </label>

              <input
                id="age"
                type="number"
                readOnly
                placeholder="Auto calculated"
                {...register("age")}
                value={dob ? age : ""}
              />
            </div>

          </div>

          {/* City + State */}
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="city">
                City <span>*</span>
              </label>

              <input
                id="city"
                type="text"
                placeholder="Enter your city"
                {...register("city", {
                  required: "City is required",
                  minLength: {
                    value: 2,
                    message: "City name is too short",
                  },
                  maxLength: {
                    value: 50,
                    message: "City name is too long",
                  },
                })}
              />

              {errors.city && (
                <p className="field-error">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="state">
                State <span>*</span>
              </label>

              <input
                id="state"
                type="text"
                placeholder="Enter your state"
                {...register("state", {
                  required: "State is required",
                  minLength: {
                    value: 2,
                    message: "State name is too short",
                  },
                  maxLength: {
                    value: 50,
                    message: "State name is too long",
                  },
                })}
              />

              {errors.state && (
                <p className="field-error">
                  {errors.state.message}
                </p>
              )}
            </div>

          </div>

          {/* Pincode */}
          <div className="form-group">
            <label htmlFor="pincode">
              Pincode <span>*</span>
            </label>

            <input
              id="pincode"
              type="text"
              placeholder="6 digit pincode"
              maxLength={6}
              {...register("pincode", {
                required: "Pincode is required",
                pattern: {
                  value: /^[1-9][0-9]{5}$/,
                  message: "Enter a valid 6-digit pincode",
                },
              })}
            />

            {errors.pincode && (
              <p className="field-error">
                {errors.pincode.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="reset-button"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Reset
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default Registration;