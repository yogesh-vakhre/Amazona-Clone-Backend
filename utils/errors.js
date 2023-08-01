const authErrors = {
  invalidUser: "Invalid email or password!",
  userNotFound: "User not found!",
  userAlreadyExists: "User already exists!",
  tokenExpired: "Token has expired!",
  tokenInvalid: "Token is invalid!",
  passwordNotMatch: "Password are not the same!",
  passwordNotCorrect: "Password is not correct!",
  emailNotSent: "Email could not be sent!",
  emailNotVerified:
    "Email is not verified!. Head over to your inbox and verify the email",
  emailAlreadyVerified: "Email is already verified!",
  emailAlreadyExists: "Email already exists!",
  emailNotExists: "Email does not exists!",
  currentPasswordWrong: "Current password is wrong!",
  passwordSameAsPrevious: "New password is same as previous password!",
  provideEmail: "Please provide an email!",
  providePassword: "Please provide a password!",
  notLoggedIn: "You are not logged in!",
  tokenUserDoesNotExist: "Token user does not exist!",
  userChangedPassword: "User recently changed password! Please login again!",
};

module.exports = {
  authErrors,
};
