import { useForm } from "react-hook-form"; 
import "./Registration.css"; 
import { useNavigate } from "react-router-dom"; 

function Registration() { 
  const navigate = useNavigate(); 
  
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
      education_level: "", 
      preferred_field: "", 
      career_goal: "",
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
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setValue("age", calculatedAge);
  };

  const onSubmit = async (data) => { 
    try {
      console.log("Submitting Registration data:", data);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), 
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login"); 
      } else {
        alert(`Error: ${responseData.message || 'Registration failed'}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Check if backend is running.");
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Registration</h1>
          <p>Please fill in your details</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="form-group">
            <label htmlFor="name">Full Name <span>*</span></label>
            <input id="name" type="text" placeholder="Enter your full name" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must contain at least 2 characters" }, maxLength: { value: 55, message: "Name cannot exceed 55 characters" }, pattern: { value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: "Name can contain only letters and spaces" } })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender <span>*</span></label>
            <select id="gender" {...register("gender", { required: "Please select your gender" })}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="field-error">{errors.gender.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span>*</span></label>
            <input id="email" type="email" placeholder="example@gmail.com" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" } })} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password <span>*</span></label>
            <input id="password" type="password" placeholder="Enter a strong password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must contain at least 8 characters" }, maxLength: { value: 128, message: "Password cannot exceed 128 characters" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: "Password must contain uppercase, lowercase, number and special character" } })} />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number <span>*</span></label>
            <input id="phone" type="tel" placeholder="10 digit phone number" maxLength={10} {...register("phone", { required: "Phone number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian phone number" } })} />
            {errors.phone && <p className="field-error">{errors.phone.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">Date of Birth <span>*</span></label>
              <input id="dob" type="date" max={new Date().toISOString().split("T")[0]} {...register("dob", { required: "Date of birth is required", onChange: (e) => calculateAge(e.target.value) })} />
              {errors.dob && <p className="field-error">{errors.dob.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" readOnly placeholder="Auto calculated" {...register("age")} value={dob ? age : ""} />
            </div>
          </div>

          {/* Education + Preferred Field */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="education_level">Education Level <span>*</span></label>
              <select id="education_level" {...register("education_level", { required: "Education level is required" })}>
                <option value="">Select Education</option>
                <option value="high_school">High School (10th/12th)</option>
                <option value="diploma">Diploma</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
              </select>
              {errors.education_level && <p className="field-error">{errors.education_level.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="preferred_field">Preferred Field <span>*</span></label>
              <input id="preferred_field" type="text" placeholder="e.g. IT, Marketing, Design" {...register("preferred_field", { required: "Preferred field is required" })} />
              {errors.preferred_field && <p className="field-error">{errors.preferred_field.message}</p>}
            </div>
          </div>

          {/* Career Goal */}
          <div className="form-group">
            <label htmlFor="career_goal">Career Goal <span>*</span></label>
            <textarea 
              id="career_goal" 
              placeholder="What do you want to become? (e.g. Software Engineer)" 
              rows="2"
              style={{ padding: '10px', borderRadius: '7px', border: '1px solid #d1d5db', fontFamily: 'inherit', outline: 'none', fontSize: '15px' }}
              {...register("career_goal", { required: "Career goal is required" })} 
            ></textarea>
            {errors.career_goal && <p className="field-error">{errors.career_goal.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City <span>*</span></label>
              <input id="city" type="text" placeholder="Enter your city" {...register("city", { required: "City is required", minLength: { value: 2, message: "City name is too short" }, maxLength: { value: 50, message: "City name is too long" } })} />
              {errors.city && <p className="field-error">{errors.city.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="state">State <span>*</span></label>
              <input id="state" type="text" placeholder="Enter your state" {...register("state", { required: "State is required", minLength: { value: 2, message: "State name is too short" }, maxLength: { value: 50, message: "State name is too long" } })} />
              {errors.state && <p className="field-error">{errors.state.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode <span>*</span></label>
            <input id="pincode" type="text" placeholder="6 digit pincode" maxLength={6} {...register("pincode", { required: "Pincode is required", pattern: { value: /^[1-9][0-9]{5}$/, message: "Enter a valid 6-digit pincode" } })} />
            {errors.pincode && <p className="field-error">{errors.pincode.message}</p>}
          </div>

          <div className="form-actions">
            <button type="button" className="reset-button" onClick={() => reset()} disabled={isSubmitting}>Reset</button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Register"}</button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Registration;