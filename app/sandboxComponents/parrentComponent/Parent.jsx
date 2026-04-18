

import styles from "./parent.module.css"
import {DataContext} from "../context"




export default function Parrent({children}) {
  return (
   <DataContext.Provider value={"red"}>
    <div className={styles.parrent}>{children}</div>
   </DataContext.Provider>
  )
}