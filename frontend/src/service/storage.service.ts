import { IAccessTokenPair } from "../interface/auth.interface.ts";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant/storage.constant.ts";

export const storageService = {

    setTokens: ( { refreshToken, accessToken }: IAccessTokenPair ) => {
        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
    },

    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),

    deleteTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    }

};