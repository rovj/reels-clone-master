import React, { useContext } from 'react'
import ReactDOM from 'react-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/ChangeModal.scss'

function ChangeModal({ open, resetEdit, children, state }) {
	const theme = useContext(AuthContext).theme

	return ReactDOM.createPortal(
		<>
			{open === true && (
				<>
					<span className='close' onClick={resetEdit}>
						<i class='fa-regular fa-circle-xmark'></i>
					</span>
					<div className='back'>
						<div
							className={
								'theme-container-modal ' +
								(theme === 'dark' ? 'dark ' : ' ') +
								((state.isEditMenu === true ||
								state.isUpdateName === true ||
								state.isUpdateEmail === true
									? 'container-modal-change small-modal'
									: 'container-modal-change large-modal') +
									(state.isEditMenu === true ? ' edit-update' : ''))
							}
						>
							{children}
						</div>
					</div>
				</>
			)}
		</>,
		document.getElementById('modal-change-root')
	)
}

export default ChangeModal
