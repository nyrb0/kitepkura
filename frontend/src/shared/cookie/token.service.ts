import Cookies from "js-cookie";

const ACCESS_TOKEN_TTL = 30;

export enum EnumTokens {
  "ACCESS_TOKEN" = "access_token",
}

export const getAccessToken = () => {
  const accessToken = Cookies.get(EnumTokens.ACCESS_TOKEN);
  return accessToken || null;
};

export const saveAccessTokenStorage = (accessToken: string) => {
  Cookies.set(EnumTokens.ACCESS_TOKEN, accessToken, {
    expires: ACCESS_TOKEN_TTL,
    path: "/",
    sameSite: "Strict",
  });
};

export const removeFromStorage = () => {
  Cookies.remove(EnumTokens.ACCESS_TOKEN, {
    path: "/",
  });
};
