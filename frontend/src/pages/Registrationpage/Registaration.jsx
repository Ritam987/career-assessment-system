import { useForm } from "react-hook-form"; 
import "./Registration.css"; 
import { useNavigate } from "react-router-dom"; 
import { useLanguage } from '../../context/LanguageContext';

function Registration() { 
  const navigate = useNavigate(); 
  const { t } = useLanguage();
  
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
          <h1>{t('register.title')}</h1>
          <p>{t('register.subtitle')}</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="form-group">
            <label htmlFor="name">{t('register.fullName')} <span>*</span></label>
            <input id="name" type="text" placeholder={t('register.placeholderName')} {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must contain at least 2 characters" }, maxLength: { value: 55, message: "Name cannot exceed 55 characters" }, pattern: { value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: "Name can contain only letters and spaces" } })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">{t('register.gender')} <span>*</span></label>
            <select id="gender" {...register("gender", { required: "Please select your gender" })}>
              <option value="">{t('register.selectGender')}</option>
              <option value="male">{t('register.genderMale')}</option>
              <option value="female">{t('register.genderFemale')}</option>
              <option value="other">{t('register.genderOther')}</option>
            </select>
            {errors.gender && <p className="field-error">{errors.gender.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('register.email')} <span>*</span></label>
            <input id="email" type="email" placeholder={t('register.placeholderEmail')} {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" } })} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('register.password')} <span>*</span></label>
            <input id="password" type="password" placeholder={t('register.placeholderPassword')} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must contain at least 8 characters" }, maxLength: { value: 128, message: "Password cannot exceed 128 characters" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: "Password must contain uppercase, lowercase, number and special character" } })} />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t('register.phone')} <span>*</span></label>
            <input id="phone" type="tel" placeholder={t('register.placeholderPhone')} maxLength={10} {...register("phone", { required: "Phone number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian phone number" } })} />
            {errors.phone && <p className="field-error">{errors.phone.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">{t('register.dob')} <span>*</span></label>
              <input id="dob" type="date" max={new Date().toISOString().split("T")[0]} {...register("dob", { required: "Date of birth is required", onChange: (e) => calculateAge(e.target.value) })} />
              {errors.dob && <p className="field-error">{errors.dob.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="age">{t('register.age')}</label>
              <input id="age" type="number" readOnly placeholder={t('register.autoCalculated')} {...register("age")} value={dob ? age : ""} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="education_level">{t('register.education')} <span>*</span></label>
              <select id="education_level" {...register("education_level", { required: "Education level is required" })}>
                <option value="">{t('register.selectEducation')}</option>
                <option value="high_school">High School (10th/12th)</option>
                <option value="diploma">Diploma</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
              </select>
              {errors.education_level && <p className="field-error">{errors.education_level.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="preferred_field">{t('register.preferredField')} <span>*</span></label>
              <input id="preferred_field" type="text" placeholder={t('register.placeholderField')} {...register("preferred_field", { required: "Preferred field is required" })} />
              {errors.preferred_field && <p className="field-error">{errors.preferred_field.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="career_goal">{t('register.careerGoal')} <span>*</span></label>
            <textarea 
              id="career_goal" 
              placeholder={t('register.placeholderCareer')} 
              rows="2"
              style={{ padding: '10px', borderRadius: '7px', border: '1px solid #d1d5db', fontFamily: 'inherit', outline: 'none', fontSize: '15px' }}
              {...register("career_goal", { required: "Career goal is required" })} 
            ></textarea>
            {errors.career_goal && <p className="field-error">{errors.career_goal.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">{t('register.city')} <span>*</span></label>
              <input id="city" type="text" placeholder={t('register.placeholderCity')} {...register("city", { required: "City is required", minLength: { value: 2, message: "City name is too short" }, maxLength: { value: 50, message: "City name is too long" } })} />
              {errors.city && <p className="field-error">{errors.city.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="state">{t('register.state')} <span>*</span></label>
              <input id="state" type="text" placeholder={t('register.placeholderState')} {...register("state", { required: "State is required", minLength: { value: 2, message: "State name is too short" }, maxLength: { value: 50, message: "State name is too long" } })} />
              {errors.state && <p className="field-error">{errors.state.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">{t('register.pincode')} <span>*</span></label>
            <input id="pincode" type="text" placeholder={t('register.placeholderPincode')} maxLength={6} {...register("pincode", { required: "Pincode is required", pattern: { value: /^[1-9][0-9]{5}$/, message: "Enter a valid 6-digit pincode" } })} />
            {errors.pincode && <p className="field-error">{errors.pincode.message}</p>}
          </div>

          <div className="form-actions">
            <button type="button" className="reset-button" onClick={() => reset()} disabled={isSubmitting}>{t('register.reset')}</button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>{isSubmitting ? t('register.submitting') : t('register.submit')}</button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Registration;