import { Conversation, ConversationUser, Message, User } from "../../model";
import { ApiException } from "../../exception";
import { groupConversationPresenter, privateConversationPresenter } from "../../presenter";

export const leaveGroupConversationService = async ( conversationId: number, currentUserId: number, limit: number ) => {

   const [ isUserAdmin, isGroupConversation ] = await Conversation
       .findByPk( conversationId )
       .then( res => [
          Boolean( res?.adminId === currentUserId ),
          Boolean( res?.isGroupConversation === true )
       ] );

   if ( !isGroupConversation ) throw new ApiException( "It is not group conversation", 400 );
   if ( isUserAdmin ) throw new ApiException( "Admin can not leave own conversation", 400 );

   await ConversationUser.destroy( {
      where: {
         conversationId,
         userId: currentUserId
      }
   } );

   const conversations = await User.findByPk( currentUserId, {
      include: {
         model: Conversation,
         as: "conversations",
         through: {
            attributes: []
         },
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
               as: "lastMessage"
            }
         ],
      },
      order: [
         [ { model: Conversation, as: "conversations", isSelfAssociation: true }, "lastModified", "DESC" ],
         [ "conversations", "users", "id", "ASC" ],
         [ "conversations", "lastMessage", "id", "ASC" ]
      ]
   } )
       .then( user => {
          const conversations = user?.conversations || undefined;

          if ( conversations ) return conversations.map( c => {
             if ( c.isGroupConversation ) return groupConversationPresenter( c.toJSON(), currentUserId );
             if ( !c.isGroupConversation ) return privateConversationPresenter( c.toJSON(), currentUserId );
          } );

          return conversations;
       } );

   return {
      data: conversations && (limit ? Array.from( conversations ).splice( 0, limit ) : conversations),
      count: conversations && (limit ? Array.from( conversations ).splice( 0, limit ).length : conversations.length)
   };

};