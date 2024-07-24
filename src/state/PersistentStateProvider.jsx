"use client"
import React, { useEffect, createContext, useContext, useReducer} from 'react';
import { INTRO } from '@/consts';
export const localStorageKey = 'ecctrl-advanced-game-engine_0.0.0_local-state'
// type StateType = {
// }
// type StateProps = {
//   state: StateType,
//   dispatch: any
// }
export const persistentInitialState = {
  level: INTRO,
  character: 'demon',
}

// type ActionType = {
//   type: string;
//   payload?: any;
// }

export const PersistentAppReducer = (state, action) => {
  switch (action.type){
    case "INIT_STATE": {
      console.log('loading data', action.payload)
      return action.payload
    }
    case "SET_LEVEL": {
      if(action.payload.level){
        return ({...state, level: action.payload.level })
      }
      console.warn('tried to set level without payload value level')
      return state
    }
    case "SET_CHARACTER": {
      return {...state, character: action.character }
    }
    default: {
      alert("unhandled reducer action type"+action.type)
      return state
    }
  }
};
// Create the context
const PersistentAppContext = createContext({ state: persistentInitialState, dispatch: () => null });
// Create a provider component
export const PersistentAppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(PersistentAppReducer, persistentInitialState);
  useEffect(() => {
    let localData = null
    try {
      localData = JSON.parse(localStorage.getItem(localStorageKey) || 'null')
    } catch(err){
      console.warn('Error loading local data', err)
    }
    console.log('local data', localData)
    if(localData){
      dispatch({ 
        type: "INIT_STATE", 
        payload: localData,
     });
    }
      
 }, []);
 useEffect(() => {
  console.log('state changed')
  if(state !== persistentInitialState){
    console.log('storing new state')
    // TODO: maybe don't save for every state change 
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }
   
 }, [state]);
 
  return <PersistentAppContext.Provider value={{ state, dispatch }}>{children}</PersistentAppContext.Provider>;
};
// Export the context
export const usePersistentAppContext = () => useContext(PersistentAppContext)