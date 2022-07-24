import React, { useEffect, useState } from 'react'
import './VisitedProfile.css'
import { useContext } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import { query } from 'firebase/firestore'
import { collection } from 'firebase/firestore'
import { firestore } from '../../../Firebase'
import { where } from 'firebase/firestore'
import { orderBy } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import Modal from '../../Modal'
import Header from '../../header/Header'
import { Button, Divider, Grid, Typography } from '@mui/material'
import { doc } from 'firebase/firestore'
import { updateDoc } from 'firebase/firestore'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import noPosts from '../../../no-posts.png'

function VisitedProfile() {
	let contextObj = useContext(AuthContext)
	let user = contextObj.visitedUser
	let [numFollowers, setNumFollowers] = useState(0)
	let [numFollowing, setNumFollowing] = useState(0)
	let [posts, setPosts] = useState([])
	let [name, setName] = useState('')
	let [profileUrl, setProfileUrl] = useState('')
	let [isOpen, setIsOpen] = useState(false)
	let [cInd, setCIndex] = useState(0)
	let [username, setUsername] = useState(null)
	let followRef = useRef()
	let followingRef = useRef()
	let { id } = useParams();
	let docId = id;


	const handleOpen = (val, ind) => {
		setCIndex(ind)
		setIsOpen(val)
	}
	const handleFollow = async () => {
		let newFollowingArr = [...new Set([...contextObj.user.following, docId])]
		await updateDoc(doc(firestore, 'users', contextObj.user.docId), {
			following: newFollowingArr,
		})
		let newFolllowerArr = [...new Set([...contextObj.visitedUser.followers, contextObj.user.docId])]
		await updateDoc(doc(firestore, 'users', docId), {
			followers: newFolllowerArr,
		})
	}
	const handleFollowing = async () => {
		let newFolllowerArr = contextObj.visitedUser.followers.filter((tempUser) => {
			return tempUser !== contextObj.user.docId
		})
		newFolllowerArr = [...new Set(newFolllowerArr)]
		await updateDoc(doc(firestore, 'users', docId), {
			followers: newFolllowerArr,
		})
		let newFollowingArr = contextObj.user.following.filter((tempUser) => {
			return tempUser !== docId
		})
		newFollowingArr = [...new Set(newFollowingArr)]
		await updateDoc(doc(firestore, 'users', contextObj.user.docId), {
			following: newFollowingArr,
		})
	}
	useEffect(() => {
		if (contextObj.visitedUser !== null) {
			let temp = []
			setName(contextObj.visitedUser.fullname);
			let nameArr = contextObj.visitedUser.fullname.split(' ');
			let tempUserName = ''
			nameArr.forEach((name) => {
				tempUserName = tempUserName + name.toLowerCase() + '_'
			})
			tempUserName = tempUserName + contextObj.visitedUser.email.length
			setUsername(tempUserName)

			setProfileUrl(contextObj.visitedUser.profileUrl)
			const q = query(
				collection(firestore, 'posts'),
				where('userId', '==', docId),
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
	}, [contextObj.visitedUser])
	useEffect(() => {
		const unsub = onSnapshot(doc(firestore, 'users', docId), (doc) => {
			setNumFollowers(doc.data().followers.length)
			setNumFollowing(doc.data().following.length)
			if (doc.data().followers.includes(contextObj.user.docId)) {
				followRef.current.style.display = 'none'
				followingRef.current.style.display = 'block'
			} else {
				followRef.current.style.display = 'block'
				followingRef.current.style.display = 'none'
			}
		})
		return () => {
			unsub()
		}
		// eslint-disable-next-line
	}, [contextObj.visitedUser])
	return (
		<>
			<Header />
			<Grid className='profile-container' sx={{ backgroundColor: 'background.paper' }}>
				<Grid container lg={12} className='profile-details'>
					<Grid item lg={3} className='profile-image'>
						<img src={profileUrl} alt='' />
					</Grid>
					<Grid container lg={9} className='profile-content-container'>
						<Grid container lg={12} className='profile-content'>
							<Grid style={{ paddingRight: '0.5rem' }} item>
								<Typography variant='h5' sx={{ fontWeight: 'normal' }}>
									{username}
								</Typography>
							</Grid>
							<Grid item>
								<Button
									ref={followRef}
									onClick={handleFollow}
									variant='outlined'
									sx={{
										color: 'white',
										textTransform: 'capitalize',
										padding: '1px 10px',
										borderColor: 'text.secondary',
										fontSize: '12px',
										backgroundColor: '#0095f6',
									}}
								>
									Follow
								</Button>
								<Button
									ref={followingRef}
									onClick={handleFollowing}
									variant='outlined'
									sx={{
										color: 'white',
										textTransform: 'capitalize',
										padding: '1px 10px',
										borderColor: 'text.secondary',
										fontSize: '12px',
										backgroundColor: '#0095f6',
									}}
								>
									Following
								</Button>
							</Grid>
						</Grid>
						<Grid container lg={12} className='profile-stats'>
							<Grid item>
								<Typography variant='h6' sx={{ fontWeight: 'normal', fontSize: '14px' }}>
									<Typography variant='strong' sx={{ fontWeight: 'bold', fontSize: '14px' }}>
										{posts.length}
									</Typography>{' '}
									&nbsp;posts
								</Typography>
							</Grid>
							<Grid item>
								<Typography variant='h6' sx={{ fontWeight: 'normal', fontSize: '14px' }}>
									<Typography variant='strong' sx={{ fontWeight: 'bold', fontSize: '14px' }}>
										{numFollowers}
									</Typography>{' '}
									&nbsp;followers
								</Typography>
							</Grid>
							<Grid item>
								<Typography variant='h6' sx={{ fontWeight: 'normal', fontSize: '14px' }}>
									<Typography variant='strong' sx={{ fontWeight: 'bold', fontSize: '14px' }}>
										{numFollowing}
									</Typography>{' '}
									&nbsp;following
								</Typography>
							</Grid>
						</Grid>
						<Grid container lg={12} className='profile-stats'>
							<Typography variant='h6' sx={{ fontWeight: 'bold', fontSize: '15px' }}>
								{name}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Grid item lg={12} className='profile-posts' sx={{ margin: '30px 0' }}>
					<Divider />
				</Grid>
				<Grid container lg={12} className='profile-posts'>
					{posts.map((post, index) => {
						return (
							<Grid item lg={2.6}>
								<video
									onClick={() => handleOpen(true, index)}
									src={post.pUrl}
									className='profile-videos'
								></video>
								<Modal open={isOpen} handleOpen={handleOpen} post={post} index={index} cIndex={cInd} />
							</Grid>
						)
					})}
					{posts?.length === 0 && (
						<>
							<div className={(contextObj.theme === 'dark' ? 'dark ' : '') + 'no-posts'}>
								<div className='inner'>
									<img className='display-image' src={noPosts} width={250} alt='' srcset='' />
								</div>
								<div className='inner p'>No posts yet.</div>
							</div>
						</>
					)}
				</Grid>
			</Grid>
		</>
	)
}

export default VisitedProfile
