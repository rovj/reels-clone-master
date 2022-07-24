import React, { useEffect, useState } from 'react'
import '../styles/Profile.scss'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { query } from 'firebase/firestore'
import { collection } from 'firebase/firestore'
import { firestore } from '../Firebase'
import { where } from 'firebase/firestore'
import { orderBy } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import Modal from './Modal'
import Header from './header/Header'

function Profile() {
	let contextObj = useContext(AuthContext)
	let [posts, setPosts] = useState([])
	let [email, setEmail] = useState('')
	let [name, setName] = useState('')
	let [profileUrl, setProfileUrl] = useState('')
	let [isOpen, setIsOpen] = useState(false)
	let [cInd, setCIndex] = useState(0)
	const handleOpen = (val, ind) => {
		setCIndex(ind)
		setIsOpen(val)
	}
	useEffect(() => {
		if (contextObj.user !== null) {
			let temp = []
			setName(contextObj.user.fullname)
			setEmail(contextObj.user.email)

			setProfileUrl(contextObj.user.profileUrl)
			const q = query(
				collection(firestore, 'posts'),
				where('userId', '==', contextObj.user.docId),
				orderBy('createdAt', 'desc')
			)
			const unsub = onSnapshot(q, (querySnapshot) => {
				temp = []
				querySnapshot.forEach((doc) => {
					let data = { ...doc.data(), postId: doc.id }
					temp.push(data)
				})
				setPosts(temp)
			})
			return () => {
				unsub()
			}
		}
	}, [contextObj.user])
	return (
		<>
			{
				<>
					<Header />
					<div className='main'>
						<div className='img-div'>
							<img src={profileUrl} alt='' className='img' />
							<div>
								<b>{name}</b>
							</div>
						</div>
						<div className='post-info'>
							<div>
								<b>Email</b> : {email}
							</div>
							<br />
							<div>
								<b>Posts</b> : {posts.length}
							</div>

							<br />
						</div>
						<hr className='separator rounded' />
						<div className='post-list'>
							{posts.map((post, index) => {
								return (
									<>
										<video
											onClick={() => handleOpen(true, index)}
											src={post.pUrl}
											className='profile-videos'
										></video>
										<Modal
											open={isOpen}
											handleOpen={handleOpen}
											post={post}
											index={index}
											cIndex={cInd}
										/>
									</>
								)
							})}
						</div>
					</div>
				</>
			}
		</>
	)
}

export default Profile
