import React from 'react'
import { useState, useEffect } from 'react'
import { auth } from '../Firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { firestore } from '../Firebase'
import { collection } from 'firebase/firestore'
export let AuthContext = React.createContext()
export function AuthContextProvider({ children }) {
	let [mainLoader, setMainLoader] = React.useState(false)
	let [cUser, setUser] = useState(null)
	let [user, setUserData] = useState(null)
	let [docId, setDocId] = useState('')
	let [visitedUser, setVisitedUser] = useState(null)
	const [theme, setTheme] = React.useState('light')
	let [userList, setUserList] = useState([])
	let [seenPosts, setSeenPosts] = useState(null)

	const signout = async function () {
		await signOut(auth)
	}
	const handleSeenPosts = () => {
		const queryRef = query(collection(firestore, 'seenposts'))
		let tempSeenPosts = {}
		getDocs(queryRef).then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				tempSeenPosts[doc.data().postId] = doc.data().visitedUsers
			})
			setSeenPosts(tempSeenPosts)
		})
	}
	useEffect(() => {
		handleSeenPosts()
	}, [])
	useEffect(() => {
		if (cUser === null) {
			return
		}
		const q = query(collection(firestore, 'users'), where('userId', '==', cUser.uid))
		const unsub = onSnapshot(q, (querySnapshot) => {
			querySnapshot.forEach((doc) => {
				let data = { ...doc.data(), docId: doc.id }
				setUserData(data)
			})
		})

		return () => {
			unsub()
		}
	}, [cUser])
	useEffect(() => {
		if (user) {
			let parr = []
			const q = query(collection(firestore, 'users'))
			const unsub = onSnapshot(q, (querySnapshot) => {
				parr = []
				querySnapshot.forEach((doc) => {
					let data = { ...doc.data(), docId: doc.id }
					if (data.docId !== user.docId) {
						parr.push(data)
					}
				})
				setUserList(parr)
			})
			return () => {
				unsub()
			}
		} else {
			setUserList([])
		}
	}, [user])

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setUser(user)
				handleSeenPosts()
			} else {
				setUser(null)
				setUserData(null)
				handleSeenPosts()
			}
			setMainLoader(true)
		})
	}, [])
	return (
		<AuthContext.Provider
			value={{
				cUser,
				setUser,
				signout,
				user,
				docId,
				setUserData,
				setDocId,
				theme,
				setTheme,
				visitedUser,
				setVisitedUser,
				userList,
				seenPosts,
			}}
		>
			{mainLoader && children}
		</AuthContext.Provider>
	)
}
