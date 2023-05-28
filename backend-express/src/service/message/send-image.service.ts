import { Conversation, ConversationUser, Message, User } from "../../model";
import fileUpload, { FileArray } from "express-fileupload";
import { fileNameMaker } from "../../helper/file-name-maker.helper";
import path from "node:path";
import process from "process";
import { exists } from "../../helper/exists.helper";
import { mkdir } from "fs/promises";
import sharp from "sharp";
import { Op } from "sequelize";

export const sendImageService = async ( userId: number, files: FileArray, conversationId: number ) => {
   const user = await User.findByPk(userId);

   const avatar = files?.image as fileUpload.UploadedFile;

   const imageName = fileNameMaker(avatar);
   const folderPath = path.join(process.cwd(), "client", String(user?.email));

   const isFolderExists = await exists(folderPath);
   if (!isFolderExists) await mkdir(folderPath, { recursive: true });

   const [ newMessage ] = await Promise.all([
      await Message.create({ content: imageName, conversationId, senderId: userId!, isImage: true }),
      await sharp(avatar.data).jpeg({ quality: 70 }).toFile(path.join(folderPath, imageName))
   ]);

   const conversation = await Conversation.findByPk(conversationId);

   const [ messageWithSender ] = await Promise.all([
      Message.findByPk(newMessage.id, {
         include: {
            model: User,
            as: "sender",
            attributes: [ "id", "username", "email", "image" ]
         }
      }),
      conversation?.update({
         lastModified: Date.now()
      }),
      ConversationUser.update({
         isNewMessagesExist: true
      }, {
         where: {
            conversationId,
            userId: {
               [Op.ne]: userId
            }
         }
      })
   ]);

   return messageWithSender;
};