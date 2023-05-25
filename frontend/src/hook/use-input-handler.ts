import { useState } from "react";

import { TypedOnChange } from "../interface/common.interface.ts";

export function useInputHandler() {
   const [ value, setValue ] = useState<string>("");

   const handleChange = ( e: TypedOnChange ) => {
      if (e.target.value !== "") {
         setValue(e.target.value);
      }
   };

   return { handleChange, value, setValue };
}