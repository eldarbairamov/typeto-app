import { OAuth } from "../../model";
import { tokenService } from "../token.service";
import { REFRESH_TOKEN_TYPE } from "../../constant";
import { IAccessTokenPair } from "../../interface";

export const refreshService = async ( refreshToken: string ): Promise<IAccessTokenPair> => {

   const oAuth = await OAuth.findOne( { where: { refreshToken } } );

   const userId = tokenService.tokenVerify( refreshToken, REFRESH_TOKEN_TYPE );

   const accessTokenPair = tokenService.accessTokenPair( userId );

   await oAuth!.destroy();

   await OAuth.create( {
      ownerId: userId,
      refreshToken: accessTokenPair.refreshToken,
      accessToken: accessTokenPair.accessToken
   } );

   return accessTokenPair;

};