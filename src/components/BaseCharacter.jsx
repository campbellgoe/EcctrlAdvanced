import React from 'react'
import { Model as Demon } from './Demon'

function BaseCharacter(props) {
  return (
    <Demon {...props} />
  )
}

export default BaseCharacter