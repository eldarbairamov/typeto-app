import { Conversation, ConversationUser, Message, User } from "../../model";
import { Op } from "sequelize";
import { ApiException } from "../../exception";
import { groupConversationPresenter, privateConversationPresenter } from "../../presenter";

export const createConversationService = async ( userIds: number[], conversationName: string | undefined, currentUserId: number ) => {

   const isConversationExist = await Conversation.findAll( {
      where: {
         isGroupConversation: false
      },
      include: [
         {
            model: User,
            as: "users",
            where: {
               id: {
                  [Op.in]: userIds.concat( currentUserId )
               }
            }
         }
      ],
   } )
       .then( conversation => Boolean( conversation.filter( c => c.users.length === 2 ).length ) );

   if ( isConversationExist && !conversationName ) throw new ApiException( "Conversation with this user is already exists", 400 );

   const newConversation = await Conversation.create( {
      conversationName,
      isGroupConversation: Boolean( conversationName ),
      adminId: conversationName ? currentUserId : undefined
   } );

   const promises = userIds.map( async ( id ) => await ConversationUser.create( {
      conversationId: newConversation.id,
      userId: id
   } ) );

   await Promise.all( promises.concat( [ ConversationUser.create( {
      conversationId: newConversation.id,
      userId: currentUserId
   } ) ] ) );

   return await Conversation.findByPk( newConversation.id, {
      include: [
         {
            model: User,
            as: "users",
            attributes: [ "id", "username", "email", "image" ],
            through: {
               attributes: [ "isNewMessagesExist" ],
            },
         },
         {
            model: Message,
            as: "lastMessage",
         }
      ],
      order: [
         [ { model: User, as: "users" }, "id", "ASC" ],
      ]
   } )
       .then( conversation => {
          if ( conversation?.isGroupConversation === true ) return groupConversationPresenter( conversation?.toJSON(), currentUserId! );
          if ( conversation?.isGroupConversation === false ) return privateConversationPresenter( conversation?.toJSON(), currentUserId! );
          return conversation;
       } );

};