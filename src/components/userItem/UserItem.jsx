import React from 'react'
import './UserItem.css'
import { AuthContext } from '../../context/AuthContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

function UserItem(props) {
	let { user } = props
	let contextObj = useContext(AuthContext)
	let navigate = useNavigate()
	const handleView = () => {
		contextObj.setVisitedUser(user)
		navigate('/visit/' + user.docId)
	}
	function getUserName(user) {
		let nameArr = user.fullname.split(' ')
		let tempUserName = ''
		nameArr.forEach((name) => {
			tempUserName = tempUserName + name.toLowerCase() + '_'
		})
		tempUserName = tempUserName + user.email.length
		return tempUserName
	}
	return (
		<div onClick={handleView} className='user-item-container'>
			<div className='item-pic-credentials'>
				<div className='user-item-image'>
					<img src={user.profileUrl} alt='' className='item-image' />
				</div>
				<div className='user-item-credentials'>
					<p>
						<b>{getUserName(user)}</b>
					</p>
					<p>{user.fullname}</p>
				</div>
			</div>
			{/* <div className="view-user-item">
        <button  className="item-button">
          View
        </button>
      </div> */}
		</div>
	)
}

export default UserItem
