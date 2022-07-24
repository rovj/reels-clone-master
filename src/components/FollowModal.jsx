import React, { useContext } from 'react'
import '../styles/FollowModal.scss'
import UserItem from './userItem/UserItem'
import ReactDOM from 'react-dom'
import { AuthContext } from '../context/AuthContext'

function FollowModal(props) {
	let { isFollowerList, modalList, isOpen, resetFollow } = props
	const theme = useContext(AuthContext).theme
	return ReactDOM.createPortal(
		<>
			{isOpen === true && (
				<>
					{modalList === null ? (
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
						<>
							<span className='close' onClick={() => resetFollow()}>
								<i class='fa-regular fa-circle-xmark'></i>
							</span>
							<div className='back' />
							<div className={(theme === 'dark' ? 'dark ' : '') + 'container-follow container'}>
								<div className='modal-follow-title'>
									{isFollowerList ? <b>Followers</b> : <b>Following</b>}
								</div>
								<div className='modal-follow-body'>
									{modalList.map((user, index) => {
										return <UserItem user={user} />
									})}
								</div>
							</div>
						</>
					)}
				</>
			)}
		</>,
		document.getElementById('modal-follow-root')
	)
}

export default FollowModal
