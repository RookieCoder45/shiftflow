"use client"
import { faker } from "@faker-js/faker"
import styles from "./FakeUser.module.css"
import { useState } from "react"

export default function FakeUser() {


  const fakeData = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  shift: faker.helpers.arrayElement(["I", "J", "K", "L"]),
  main_equipment: faker.helpers.arrayElement([
    "Truck",
    "Grader",
    "Bulldozer",
    "Excavator",
  ]),
}));


  return (
    <div className={styles.fakeUser}>
    
      {fakeData.map((user) => (
        <div className={styles.user} key={user.id}>
          <span className={styles.name}>
            {user.first_name} {user.last_name}
          </span>
          <span className={styles.shift}>{user.shift}</span>
          <span className={styles.equipment}>{user.main_equipment}</span>
        </div>
      ))}
    </div>
  )

}