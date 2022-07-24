import React from 'react'
import '../styles/Videos.css'
import ReactDOM from 'react-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import { firestore } from '../Firebase'
import { getDoc } from 'firebase/firestore'

function Video(props) {
	let contextObj = useContext(AuthContext)
	const handleClick = (e) => {
		e.preventDefault()
		e.target.muted = !e.target.muted
	}

	const handleScroll = (e) => {
		let next = ReactDOM.findDOMNode(e.target).parentNode.parentNode.nextSibling

		if (next) {
			next.scrollIntoView({ behaviour: 'smooth', block: 'end' })
			e.target.muted = true
		}
	}
	const handleAdd = async () => {
		const docRef = doc(firestore, 'seenposts', props.post.seenpost)
		const docSnap = await getDoc(docRef)
		let newSeenArr = [...new Set([...docSnap.data().visitedUsers, contextObj.user.docId])]

		await updateDoc(doc(firestore, 'seenposts', props.post.seenpost), {
			visitedUsers: newSeenArr,
		})
	}
	return (
		<>
			<video
				src={props.src}
				className='videos-styling'
				onPlay={handleAdd}
				onEnded={handleScroll}
				muted='muted'
				id={`video----${props.postId}`}
				onClick={handleClick}
			></video>
		</>
	)
}

export default Video
