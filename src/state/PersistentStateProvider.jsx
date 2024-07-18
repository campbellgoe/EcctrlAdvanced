"use client"
import React, { useEffect, createContext, useContext, useReducer} from 'react';
export const localStorageKey = 'stamp-quest-offshore_0.0.0_local-state'
import { CHARACTER_SELECT } from '@/consts.js'
// type StateType = {
// }
// type StateProps = {
//   state: StateType,
//   dispatch: any
// }
const initialTokensCollected = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
]
const initialLearningOpportunitiesTokens = 3
export const persistentInitialState = {
  
  level: INTRO,
  // male or female
  character: '',
  name: '',
  email: '',
  oilrig: {
    tokensCollected: initialTokensCollected
  },
  learningOpportunities: {
    initialTokens: initialLearningOpportunitiesTokens,
    remainingTokens: initialLearningOpportunitiesTokens,
    selectedCells: [],
  }
}

// type ActionType = {
//   type: string;
//   payload?: any;
// }

export const PersistentAppReducer = (state, action) => {
  switch (action.type){
    case "COLLECT_TOKEN": {
      console.log('collecting token', action.index)
      // TODO: would be nicer to use the token names e.g. engagement instead of indexes
      const newTokens = [...(state?.oilrig?.tokensCollected || initialTokensCollected)]
      newTokens[action.index] = true
      return {...state, oilrig: {...state.oilrig, tokensCollected: newTokens } }
    }
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
    case "SET_EMAIL": {
      return {...state, email: action.email }
    }
    case "SET_NAME": {
      return {...state, name: action.name }
    }
    case "SET_LO_REMAINING_TOKENS": {
      return {
        ...state,
        learningOpportunities: {...state.learningOpportunities, remainingTokens: action.remainingTokens }
      }
    }
    case "SET_LO_SELECTED_CELLS": {
      return {
        ...state,
        learningOpportunities: {...state.learningOpportunities, selectedCells: action.selectedCells }
      }
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