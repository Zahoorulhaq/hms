import { AUTH,  } from "@/server/endpoints";
import { POST_REQUEST } from "@/server/https";
import {
  CreatePassword,
  ForgotPasswordBody,
  ResetPasswordBody,
  VerifyEmailBody,
  VerifyPinBody
} from "./auth.types";
import { DELETE_REQUEST, GET_REQUEST, LOGOUT_REQUEST } from "@/server/https";

// export const verifyEmail = async ({
//   email,
//   asset,
//   isMobile
// }: VerifyEmailBody) => {
//   const body = { email, asset, isMobile };
//   const { data }: any = await POST_REQUEST(
//     AUTH.SMART_CLIENT_VERIFY_EMAIL,
//     body
//   );
//   return data.data;
// };
// export const verifyPin = async ({
//   pinCode,
//   asset,
//   token,
//   isQuickLogin
// }: VerifyPinBody) => {
//   const body = { pinCode, asset, token, isQuickLogin };
//   const { data }: any = await POST_REQUEST(AUTH.SMART_CLIENT_VERIFY_PIN, body);
//   return data.data;
// };
// export const createPassword = async ({
//   password,
//   asset,
//   token,
//   subjectType
// }: CreatePassword) => {
//   const body = { password, asset, token, subjectType };
//   const { data }: any = await POST_REQUEST(AUTH.SMART_CREATE_PASS, body);
//   return data.data;
// };
// export const forgotPassword = async ({ email, asset }: ForgotPasswordBody) => {
//   const body = { email, asset, isMobile: true, isCreatePassword: false };
//   const { data }: any = await POST_REQUEST(AUTH.SMART_FORGOT_PASS, body);
//   return data.data;
// };
// export const resetPassword = async ({
//   password,
//   asset,
//   token,
//   pinCode
// }: ResetPasswordBody) => {
//   const body = { password, asset, isMobile: false, token, pinCode };
//   const { data }: any = await POST_REQUEST(AUTH.SMART_RESET_PASS, body);
//   return data.data;
// };
export const logout = async () => {
  const { data }: any = await LOGOUT_REQUEST('/api/auth/logout');
  return data.data;
};
export const getS = async () => {
  const { data }: any = await GET_REQUEST("/v1/portfolio/properties");
  return data.data;
};

export const loginRequest = async (email: string, password: string) => {
  const body = { email, password };
  const { data }: any = await POST_REQUEST(AUTH.LOGIN, body);
  return data.data;
}
export const logoutRequest = async (token:string) => {
  const { data }: any = await DELETE_REQUEST(AUTH.LOGOUT);
  return data.data;
}
export const me = async () => {
  const { data }: any = await GET_REQUEST(AUTH.ME);
  return data.data;
}