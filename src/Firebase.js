import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Timestamp } from "firebase/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import secret from "./secrets";

let app = initializeApp(secret);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = {
  users: collection(firestore, "users"),
  getTimeStamp: Timestamp.now(),
};
console.log(database.getTimeStamp);
