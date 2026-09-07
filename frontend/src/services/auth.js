export const registerUser = async (userData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log("Mock API Call: Registering user with data:", userData);

  // Return a successful response
  return {
    success: true,
    message: "Registration successful!",
    data: {
      userId: "usr_12345",
      ...userData
    }
  };
};
