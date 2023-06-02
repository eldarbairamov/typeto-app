import { Contacts, User } from "../../model";

export const deleteContactService = async ( contactId: number, currentUserId: number ) => {

   await Contacts.destroy({
      where: {
         userId: currentUserId,
         contactId
      }
   });

   return await User.findOne({
      where: {
         id: 1
      },
      include: "contacts"
   })
       .then(user => user?.contacts);

};