export class RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export class LoginUserRequest {
  email: string;
  password: string;
}

export class UserResponse {
  firstName: string;
  lastName: string;
  email: string;
  refreshToken?: string;
  accessToken?: string;
}

export class UpdateUserProfile {
  picture?: string;
  firstName?: string;
  lastName?: string;
}

export class EmailConfig {
  recipients: string;
  html: string;
  subject: string;
  text?: string;
}

export class VerificationRequest {
  codeOTP: string;
  email: string;
}

export class GoogleOauth {
  id: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: string;
  scope: string[];
  email: string;
}
