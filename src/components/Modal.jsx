import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import '../styles/Modal.scss'
import ChatBox from './ChatBox'
function Modal({ open, handleOpen, post, index, cIndex }) {
	const theme = useContext(AuthContext).theme

	return (
		<>
			{open === true && cIndex === index && (
				<>
					<span className='close' onClick={() => handleOpen(false)}>
						<i class='fa-regular fa-circle-xmark'></i>
					</span>
					<div className='back' />
					<div className={(theme === 'dark' ? 'dark ' : ' ') + 'container-modal container-chat-theme'}>
						<div className='video-wrapper'>
							<>
								<video
									src={post.pUrl}
									className='videos-styling'
									autoPlay
									muted='muted'
									controls
								></video>
							</>
						</div>
						<div className='chat-container'>
							<ChatBox post={post} />
						</div>
					</div>
				</>
			)}
		</>
	)
}

export default Modal
