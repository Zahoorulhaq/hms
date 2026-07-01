export interface VerifyEmailBody {
  email: string;
  asset: string;
  isMobile: boolean;
}
export interface VerifyPinBody {
  pinCode: string;
  asset: string;
  token: string;
  isQuickLogin: boolean;
}
export interface CreatePassword {
  password: string;
  asset: string;
  token: string;
  subjectType: string;
}
export interface ResetPasswordBody {
  password: string;
  asset: string;
  token: string;
  pinCode: string;
}
export interface ForgotPasswordBody {
  email: string;
  asset: string;
}
