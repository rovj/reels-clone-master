import React, { useEffect, useState, useContext } from 'react'

import { AuthContext } from '../context/AuthContext'
import { firestore } from '../Firebase'
import { addDoc, collection, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

import '../styles/ChatBox.scss' //imports

function ChatBox({ post }) {
	let [text, setText] = useState('') // naming
	let contextObj = useContext(AuthContext) // contextObject destructure

	let [arr, setArr] = useState([]) // arr naming change
	let [loader, setLoader] = useState(false)

	useEffect(() => {
		const q = query(
			collection(firestore, 'comments'),
			where('postId', '==', post.postId),
			orderBy('createdAt', 'desc')
		)
		let temp = [] // temp naming change
		const unsub = onSnapshot(q, (querySnapshot) => {
			temp = []
			querySnapshot.forEach((doc) => {
				let data = doc.data()
				temp.push(data) // temp = [...temp, data]
			})
			setArr(temp) // naming change
		})
		return () => {
			unsub() //unSubscribeStore()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleText = (e) => {
		setText(e.target.value) // make it one-liner at time of calling itself
	}
	const postComment = () => {
		if (text === '') {
			return
		}

		let obj = {
			// obj context eg: chartObj, userInfoObj
			text: text,
			uProfileImage: contextObj.user.profileUrl,
			uName: contextObj.user.fullname,
			postId: post.postId,
			createdAt: Timestamp.now(),
		}
		setLoader(true)
		addDoc(collection(firestore, 'comments'), obj)
			.then((ref) => {
				let newArr = [...post.comments] // name convention
				newArr.unshift(ref.id) // ['vhkfbvhfd', 'dfjvnfjv', 'njfvjfb'];
				updateDoc(doc(firestore, 'posts', post.postId), {
					comments: newArr,
				})
					.then(() => {
						setLoader(false)
						setText('')
					})
					.catch((err) => {
						console.error(err)
						setLoader(false)
						setText('')
					})
			})
			.catch((err) => {
				setLoader(false)
				setText('')
			})
	}

	// a === 'true' a=true
	let opacity = text.length > 0 ? 'opacity' : 'less-opacity' // use const as much as possible, naming blurPostBtn normalPostBtn
	return (
		// BEM convention
		<div className='comments'>
			<div className='top'>
				<img src={post.uProfile} alt='' className='post-pic' />
				<div className='stripe-container'>
					<div className='name'>
						<b>{post.uName}</b>
					</div>
					<div className='temp-text'>Orginal Audio</div>
				</div>
			</div>
			<div className='comment-area'>
				{loader === true ? (
					<div class='loader'>
						<svg className='circular'>
							<circle
								className='path'
								cx='50'
								cy='50'
								r='0'
								fill='none'
								stroke-width='5'
								strokeMiterlimit='10'
							></circle>
						</svg>
					</div>
				) : (
					arr.map((comment, index) => (
						<div className='comment' key={index}>
							<img alt='' className='img_reel comment-img' src={comment.uProfileImage} />
							{'\u00A0'}
							{'\u00A0'}
							{'\u00A0'}
							<div className='comment-text '>
								{' '}
								<b>{comment.uName}</b>
								{'\u00A0'} {comment.text}
							</div>
						</div>
					))
				)}
			</div>
			<div className='post-area'>
				<div className='post-area-inner'>
					<textarea
						placeholder='Add a comment...'
						className='post-text'
						value={text}
						onChange={(e) => handleText(e)}
						rows='2'
						cols='65'
					/>
					<span onClick={postComment} className={`post-button`}>
						<p className={`post-button-text ${opacity}`}>Post</p>
					</span>
				</div>
			</div>
		</div>
	)
}

export default ChatBox
