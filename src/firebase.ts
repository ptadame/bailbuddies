import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCI74enjD05o2vAq4ICfby nS-ntHa2fodk",
  authDomain: "bail-buddies.firebaseapp.com",
  databaseURL: "https://bail-buddies-default-rtdb.firebaseio.com",
  projectId: "bail-buddies",
  storageBucket: "bail-buddies.appspot.com",
  messagingSenderId: "922937140963",
  appId: "1:922937140963:web:7cb64738276e0329c687d6"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
