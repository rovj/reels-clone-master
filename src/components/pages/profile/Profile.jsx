import React, { useEffect, useReducer, useState } from 'react'
import './Profile.scss'
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
import { Logout, Settings } from '@mui/icons-material'
import { LinearProgress } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage'
import { addDoc } from 'firebase/firestore'
import { doc, getDocs } from 'firebase/firestore'
import { storage } from '../../../Firebase'
import { updateDoc } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { documentId } from 'firebase/firestore'
import FollowModal from '../../FollowModal'
import ChangeModal from '../../ChangeModal'
import { useCallback } from 'react'
import { useRef } from 'react'
import { getAuth, updatePassword } from 'firebase/auth'
import { updateEmail } from 'firebase/auth'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import noPosts from '../../../no-posts.png'
let followInitialState = {
	isOpenFollow: false,
	isFollowerList: false,
	followList: null,
}
let editInitialState = {
	isOpenEdit: false,
	isState: {
		isEditMenu: false,
		isUpdateName: false,
		isUpdateProfilePic: false,
		isUpdatePassword: false,
		isUpdateEmail: false,
	},
}

function editReducer(state, action) {
	switch (action.type) {
		case 'open':
			return {
				isOpenEdit: true,
				isState: {
					...editInitialState.isState,
					isEditMenu: true,
				},
			}
		case 'name':
			return {
				isOpenEdit: true,
				isState: {
					...editInitialState.isState,
					isUpdateName: true,
				},
			}
		case 'password':
			return {
				isOpenEdit: true,
				isState: {
					...editInitialState.isState,
					isUpdatePassword: true,
				},
			}
		case 'email':
			return {
				isOpenEdit: true,
				isState: {
					...editInitialState.isState,
					isUpdateEmail: true,
				},
			}
		case 'resetEditModal':
			return editInitialState
		default:
			return state
	}
}
function followReducer(state, action) {
	switch (action.type) {
		case 'follow':
			return {
				isOpenFollow: true,
				isFollowerList: true,
				followList: action.payload,
			}
		case 'following':
			return {
				isOpenFollow: true,
				isFollowerList: false,
				followList: action.payload,
			}
		case 'reset':
			return followInitialState
		default:
			return state
	}
}
function Profile() {
	let contextObj = useContext(AuthContext)
	let [posts, setPosts] = useState([])
	let [name, setName] = useState('')
	let [profileUrl, setProfileUrl] = useState('')
	let [isOpen, setIsOpen] = useState(false)
	let [cInd, setCIndex] = useState(0)
	let [username, setUsername] = useState(null)
	let [error, setError] = useState('')
	let [numFollowers, setNumFollowers] = useState(0)
	let [numFollowing, setNumFollowing] = useState(0)
	let [loader, setLoader] = useState(false)
	let [profileImgFile, setProfileImgFile] = useState(null)
	let snackRef = useRef()
	let nameRef = useRef()
	let oldPasswordRef = useRef()
	let newPasswordRef = useRef()
	let confirmPasswordRef = useRef()
	let emailRef = useRef()
	let emailPasswordRef = useRef()
	let user = contextObj.user

	useEffect(() => {
		if (profileImgFile) {
			updateProfilePicture()
		}
		// eslint-disable-next-line
	}, [profileImgFile])

	const updateCurrentPassword = () => {
		if (
			newPasswordRef.current.value !== confirmPasswordRef.current.value ||
			newPasswordRef.current.value === '' ||
			newPasswordRef.current.value === null ||
			newPasswordRef.current.value === undefined ||
			oldPasswordRef.current.value === '' ||
			oldPasswordRef.current.value === null ||
			oldPasswordRef.current.value === undefined
		) {
			setToastError('Enter proper values!')
		} else {
			const auth = getAuth()
			const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPasswordRef.current.value)
			setLoader(true)
			let newPassword = newPasswordRef.current.value
			reauthenticateWithCredential(auth.currentUser, credential)
				.then(() => {
					updatePassword(auth.currentUser, newPassword)
				})
				.then(() => {
					setLoader(false)
					resetEdit()
					setToastError('Password Changed Successfully!')
				})
				.catch((error) => {
					setLoader(false)
					resetEdit()
					setToastError(error)
				})
		}
	}
	const updateCurrentEmail = () => {
		if (
			emailRef.current.value === '' ||
			emailRef.current.value === null ||
			emailRef.current.value === undefined ||
			emailPasswordRef.current.value === '' ||
			emailPasswordRef.current.value === null ||
			emailPasswordRef.current.value === undefined
		) {
			setToastError('Enter proper values!')
		} else {
			const auth = getAuth()
			const credential = EmailAuthProvider.credential(auth.currentUser.email, emailPasswordRef.current.value)
			setLoader(true)
			let newEmail = emailRef.current.value
			reauthenticateWithCredential(auth.currentUser, credential)
				.then(() => {
					updateEmail(auth.currentUser, newEmail)
				})
				.then(() => {
					updateDoc(doc(firestore, 'users', contextObj.user.docId), {
						email: newEmail,
					})
				})
				.then(() => {
					setLoader(false)
					resetEdit()
					setToastError('Email Changed Successfully!')
				})
				.catch((error) => {
					setLoader(false)
					resetEdit()
					setToastError(error)
				})
		}
	}
	const setToastError = (err) => {
		snackRef.current.innerHTML = err
		snackRef.current.className = 'showSnackbar'
		setTimeout(function () {
			snackRef.current.className = snackRef.current.className.replace('showSnackbar', '')
		}, 3000)
	}

	const selectProfileImg = () => {
		document.getElementById('profile_image_edit').value = ''
		document.getElementById('profile_image_edit').click()
	}

	function uploadProfileDatabase(url) {
		updateDoc(doc(firestore, 'users', contextObj.user.docId), {
			profileUrl: url,
		})
			.then(() => {
				setLoader(false)
				resetEdit()
			})
			.catch((err) => {
				setLoader(false)
				resetEdit()
				setToastError(err.message)
			})
	}
	const updateProfilePicture = async () => {
		if (profileImgFile === null) {
			resetEdit()
			setToastError('Please upload a profile image')
			return
		}
		try {
			setLoader(true)
			const storageRef = ref(storage, `/users/${contextObj.user.docId}/ProfileImage`)
			const uploadTask = uploadBytesResumable(storageRef, profileImgFile)
			uploadTask.on(
				'state_changed',
				() => {},
				(error) => {
					setLoader(false)
					resetEdit()
					setToastError(error)
					return
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						uploadProfileDatabase(downloadURL)
					})
				}
			)
		} catch (err) {
			setLoader(false)
			resetEdit()
			setToastError(err.message)
		}
	}

	let [followState, followDispatch] = useReducer(followReducer, followInitialState)
	let [editState, editDispatch] = useReducer(editReducer, editInitialState)

	const handleChangeName = () => {
		if (nameRef.current.value === '' || nameRef.current.value === null || nameRef.current.value === undefined) {
			snackRef.current.innerHTML = 'Please enter a valid name!'
			snackRef.current.className = 'showSnackbar'
			setTimeout(function () {
				snackRef.current.className = snackRef.current.className.replace('showSnackbar', '')
			}, 3000)
			resetEdit()
			return
		}
		setLoader(true)
		updateDoc(doc(firestore, 'users', contextObj.user.docId), {
			fullname: nameRef.current.value,
		})
			.then(() => {
				setLoader(false)
				resetEdit()
			})
			.catch((err) => {
				setLoader(false)
				resetEdit()
				snackRef.current.innerHTML = err
				snackRef.current.className = 'showSnackbar'
				setTimeout(function () {
					snackRef.current.className = snackRef.current.className.replace('showSnackbar', '')
				}, 3000)
			})
	}
	const handleFollowers = async () => {
		let userList = user.followers
		let tempFollowers = []
		const q = query(collection(firestore, 'users'), where(documentId(), 'in', userList))
		const querySnapshot = await getDocs(q)
		querySnapshot.forEach((doc) => {
			let data = { ...doc.data(), docId: doc.id }
			tempFollowers.push(data)
		})
		followDispatch({ type: 'follow', payload: tempFollowers })
	}
	const handleFollowing = async () => {
		let userList = user.following
		let tempFollowing = []
		const q = query(collection(firestore, 'users'), where(documentId(), 'in', userList))
		const querySnapshot = await getDocs(q)
		querySnapshot.forEach((doc) => {
			let data = { ...doc.data(), docId: doc.id }
			tempFollowing.push(data)
		})
		followDispatch({ type: 'following', payload: tempFollowing })
	}
	const resetFollow = useCallback(() => {
		followDispatch({ type: 'reset' })
	}, [])
	const resetEdit = useCallback(() => {
		editDispatch({ type: 'resetEditModal' })
	}, [])
	const handleClickProfile = () => {
		document.getElementById('upload-input').value = ''
		document.getElementById('upload-input').click()
	}
	const handleSignOut = () => {
		contextObj.setTheme('light')
		contextObj.signout()
	}
	const handleOpen = (val, ind) => {
		setCIndex(ind)
		setIsOpen(val)
	}
	const apply = () => {
		document.getElementById('pb').style.display = 'block'
	}
	const remove = () => {
		document.getElementById('pb').style.display = 'none'
	}
	useEffect(() => {
		if (contextObj.user !== null) {
			let temp = []
			setName(contextObj.user.fullname)
			const unsub2 = onSnapshot(doc(firestore, 'users', contextObj.user.docId), (doc) => {
				setNumFollowers(doc.data().followers.length)
				setNumFollowing(doc.data().following.length)
			})
			let nameArr = contextObj.user.fullname.split(' ')
			let tempUserName = ''
			nameArr.forEach((name) => {
				tempUserName = tempUserName + name.toLowerCase() + '_'
			})
			tempUserName = tempUserName + contextObj.user.email.length
			setUsername(tempUserName)

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
				unsub2()
			}
		}
	}, [contextObj.user])
	const handleChangeProfile = (file) => {
		
		if (file === null) {
			setError('Please upload a file')
			setTimeout(() => {
				setError('')
			}, 2000)
			return
		}
		if (file.size / (1024 * 1024) > 100) {
			setError('Please select a file less than 100MB')
			setTimeout(() => {
				setError('')
			}, 2000)
			return
		}
		apply()
		let uid = uuidv4()
		const storageRef = ref(storage, `/users/${uid}/${file.name}`)
		const uploadTask = uploadBytesResumable(storageRef, file)
		uploadTask.on(
			'state_changed',
			() => {},
			(error) => {
				setError(error)

				setTimeout(() => {
					setError('')
				}, 2000)
				remove()
				return
			},
			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					addDoc(collection(firestore, 'seenposts'), {
						postId: '',
						visitedUsers: [],
					}).then((seenRef) => {
						let obj = {
							likes: [],
							comments: [],
							pId: uid,
							pUrl: downloadURL,
							uName: user.fullname,
							uProfile: user.profileUrl,
							userId: user.docId,
							createdAt: Timestamp.now(),
							seenpost: seenRef.id,
						}
						addDoc(collection(firestore, 'posts'), obj)
							.then(async (ref) => {
								let newArr = [...user.postIds, ref.id]
								await updateDoc(doc(firestore, 'users', user.docId), {
									postIds: newArr,
								})
								await updateDoc(doc(firestore, 'seenposts', seenRef.id), {
									postId: ref.id,
								})
							})
							.then(() => {
								remove()
							})
							.catch((err) => {
								setError(err.message)
								setTimeout(() => {
									setError('')
								}, 2000)
								remove()
							})
					})
				})
			}
		)
	}
	return (
		<>
			<Header handleClickProfile={handleClickProfile} />
			<Grid className='profile-container' sx={{ backgroundColor: 'background.paper' }}>
				<Grid container lg={12} className='profile-details'>
					<Grid item lg={3} className='profile-image'>
						<img src={profileUrl} alt='' />
					</Grid>
					<Grid container lg={9} className='profile-content-container'>
						<Grid container lg={12} className='profile-content'>
							<Grid item>
								<Typography variant='h5' sx={{ fontWeight: 'normal' }}>
									{username}
								</Typography>
							</Grid>
							<Grid item>
								<Button
									variant='outlined'
									sx={{
										color: 'text.primary',
										textTransform: 'capitalize',
										padding: '1px 10px',
										borderColor: 'text.secondary',
										fontSize: '12px',
									}}
									onClick={() => editDispatch({ type: 'open' })}
								>
									Edit Pofile
								</Button>
							</Grid>
							<Grid item>
								<Settings />
							</Grid>
							<Grid item>
								<Logout onClick={handleSignOut} />
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
							<Grid onClick={handleFollowers} item className='followers'>
								<Typography variant='h6' sx={{ fontWeight: 'normal', fontSize: '14px' }}>
									<Typography variant='strong' sx={{ fontWeight: 'bold', fontSize: '14px' }}>
										{numFollowers}
									</Typography>{' '}
									&nbsp;followers
								</Typography>
							</Grid>
							<Grid onClick={handleFollowing} item className='following'>
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
				<LinearProgress id='pb' className='progressbar' color='inherit' sx={{ display: 'none' }} />
				<input
					type='file'
					accept='video/*'
					id='upload-input'
					onChange={(e) => handleChangeProfile(e.target.files[0])}
					style={{ display: 'none' }}
				/>
				{error !== '' && <div>{error}</div>}
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
				<FollowModal
					isFollowerList={followState.isFollowerList}
					modalList={followState.followList}
					isOpen={followState.isOpenFollow}
					resetFollow={resetFollow}
				/>
				<ChangeModal open={editState.isOpenEdit} resetEdit={resetEdit} state={editState.isState}>
					<>
						{editState.isState.isEditMenu && (
							<>
								{loader ? (
									<>
										<div className='loader'>
											<svg className='circular'>
												<circle
													class='path'
													cx='50'
													cy='50'
													r='0'
													fill='none'
													stroke-width='5'
													strokeMiterlimit='10'
												></circle>
											</svg>
										</div>
										<b>Uploading...</b>
									</>
								) : (
									<div className='edit-menu'>
										<p className='edit-menu-item' onClick={() => editDispatch({ type: 'name' })}>
											Change Name
										</p>
										<p className='edit-menu-item' onClick={() => editDispatch({ type: 'email' })}>
											Change Email
										</p>
										<p
											className='edit-menu-item'
											onClick={() => editDispatch({ type: 'password' })}
										>
											Change Password
										</p>
										<p className='edit-menu-item' onClick={selectProfileImg}>
											Change Profile Picture
										</p>
										<p className='edit-menu-item cancel-item' onClick={resetEdit}>
											Cancel
										</p>
										<input
											type='file'
											accept='image/png, image/jpeg'
											id='profile_image_edit'
											style={{ display: 'none' }}
											onChange={(e) => {
												setProfileImgFile(e.target.files[0])
											}}
										></input>
									</div>
								)}
							</>
						)}
						{editState.isState.isUpdateName && (
							<>
								{loader ? (
									<>
										<div class='loader'>
											<svg className='circular'>
												<circle
													class='path'
													cx='50'
													cy='50'
													r='0'
													fill='none'
													stroke-width='5'
													strokeMiterlimit='10'
												></circle>
											</svg>
										</div>
										<b>Updating...</b>
									</>
								) : (
									<div className='update-name'>
										<div className='modal-title update-name-title'>
											<p>
												<b>Name Updation</b>
											</p>
										</div>
										<div className='modal-content update-name-content'>
											<p>
												<b>Please enter your new name.</b>
											</p>
											<input type='text' id='changeName' ref={nameRef} />
										</div>
										<div className='modal-footer update-name-footer'>
											<button className='modal-footer-button' onClick={handleChangeName}>
												OK
											</button>
											<button className='modal-footer-button' onClick={resetEdit}>
												Cancel
											</button>
										</div>
									</div>
								)}
							</>
						)}
						{editState.isState.isUpdateEmail && (
							<>
								{loader ? (
									<>
										<div class='loader'>
											<svg className='circular'>
												<circle
													class='path'
													cx='50'
													cy='50'
													r='0'
													fill='none'
													stroke-width='5'
													strokeMiterlimit='10'
												></circle>
											</svg>
										</div>
										<b>Updating...</b>
									</>
								) : (
									<div className='update-name'>
										<div className='modal-title update-email-title'>
											<p>
												<b>Email Updation</b>
											</p>
										</div>
										<div className='modal-content update-email-content'>
											<p>
												<b>Please enter your new email.</b>
											</p>
											<input type='text' id='changeName' ref={emailRef} />
											<p>
												<b>Please enter your password.</b>
											</p>
											<input type='password' id='changeName' ref={emailPasswordRef} />
										</div>
										<div className='modal-footer update-email-footer'>
											<button className='modal-footer-button' onClick={updateCurrentEmail}>
												OK
											</button>
											<button className='modal-footer-button' onClick={resetEdit}>
												Cancel
											</button>
										</div>
									</div>
								)}
							</>
						)}
						{editState.isState.isUpdatePassword && (
							<>
								{loader ? (
									<>
										<div class='loader'>
											<svg className='circular'>
												<circle
													class='path'
													cx='50'
													cy='50'
													r='0'
													fill='none'
													stroke-width='5'
													strokeMiterlimit='10'
												></circle>
											</svg>
										</div>
										<b>Updating...</b>
									</>
								) : (
									<div className='update-password'>
										<div className='modal-title update-password-title'>
											<p>
												<b>Password Updation</b>
											</p>
										</div>
										<div className='modal-content update-password-content'>
											<p>
												<b>Old Password</b>
											</p>
											<input type='password' id='oldPassword' ref={oldPasswordRef} />
											<p>
												<b>New Password</b>
											</p>
											<input type='password' id='changePassword' ref={newPasswordRef} />
											<p>
												<b>Confirm Password</b>
											</p>
											<input type='password' id='confirmPassword' ref={confirmPasswordRef} />
										</div>
										<div className='modal-footer update-password-footer'>
											<button className='modal-footer-button' onClick={updateCurrentPassword}>
												OK
											</button>
											<button className='modal-footer-button' onClick={resetEdit}>
												Cancel
											</button>
										</div>
									</div>
								)}
							</>
						)}
					</>
				</ChangeModal>
				<div id='snackbar' ref={snackRef}></div>
			</Grid>
		</>
	)
}

export default Profile
