"use client"
import React, { useEffect, createContext, useContext, useReducer} from 'react';
const debugOn = true;
// type StateType = {
// }
// type StateProps = {
//   state: StateType,
//   dispatch: any
// }

export const ephemeralInitialState = {
  dialog: '',
}

// type ActionType = {
//   type: string;
//   payload?: any;
// }

export const EphemeralAppReducer = (state, action) => {
  switch (action.type){
    case "SET_READY": {
      return {
        ...state,
        ready: action.ready
      }
    }
    case "SET_DIALOG": {
      return {...state, dialog: action.dialog }
    }
    default: {
      alert("unhandled reducer action type"+action.type)
      return state
    }
  }
};
// Create the context
const EphemeralAppContext = createContext({ state: ephemeralInitialState, dispatch: () => null });
// Create a provider component
export const EphemeralAppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(EphemeralAppReducer, ephemeralInitialState);
  useEffect(() => {
    if(debugOn) console.info('ephemeral state changed', state)
  }, [state]);
  return <EphemeralAppContext.Provider value={{ state, dispatch }}>{children}</EphemeralAppContext.Provider>;
};
// Export the context
export const useEphemeralAppContext = () => useContext(EphemeralAppContext)