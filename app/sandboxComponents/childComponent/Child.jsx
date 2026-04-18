

import {DataContext} from "../context"
import { useContext } from "react"  

export default function Child() {

  const background = useContext(DataContext)
  return (
    <div style={{background:background}}>this is the  child  component living in the  parent component</div>
  )
}