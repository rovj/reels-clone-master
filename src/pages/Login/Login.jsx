/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import '../common.scss'
import './Login.scss'

import styles from './Login.module.scss'

function Login() {
	let [email, setEmail] = useState('')
	let [password, setPassword] = useState('')
	//let [user,setUser] = useState(null);
	let [loader, setLoader] = useState(false)
	let [error, setError] = useState('')
	let contextObj = useContext(AuthContext)
	const changeEmail = (e) => {
		setEmail(e.target.value)
	}
	const changePassword = (e) => {
		setPassword(e.target.value)
	}
	const display = async function () {
		try {
			setLoader(true)
			// eslint-disable-next-line no-unused-vars
			let userCred = await signInWithEmailAndPassword(auth, email, password)
		} catch (err) {
			setError(err.message)
			contextObj.setUser(null)
			setTimeout(() => {
				setError('')
			}, 2000)
		}
		setLoader(false)
	}

	return (
		<>
			{loader === true ? (
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
			) : (
				<>
					<div className='parent-wrapper'>
						<div className='back-login'></div>
						<div className={styles.containerLogin}>
							<img
								className={'login-image ' + styles.loginImage}
								src='https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png'
								alt=''
							/>
							<div className={styles.error}>{error !== '' && <div className='error'>{error}</div>}</div>
							<div className={styles.form}>
								<div className={styles.inputWrapper}>
									<input
										type='email'
										placeholder='Enter Email'
										value={email}
										onChange={changeEmail}
										width='100px'
										height='30px'
									/>
								</div>
								<div className={styles.inputWrapper}>
									<input
										type='password'
										placeholder='Password'
										value={password}
										onChange={changePassword}
									/>
								</div>{' '}
								<div className={styles.inputWrapper}>
									<button onClick={display}>LOG IN</button>
								</div>
							</div>
							<p className='forgot'>Forgot Password?</p>
						</div>
						{/* <div className='container-login'>
							

						</div> */}
						<div className={styles.containerLogin + ' ' + styles.signUp}>
							<p>
								Don't have an account? <Link to={'/signup'}>Sign Up</Link>
							</p>
						</div>
						<div class={`${styles.containerLogin} ${styles.signUp} ${styles.badgeContainer}`}>
							<p>Get the app</p>
							<div class={styles.badge}>
								<img
									src='https://www.instagram.com/static/images/appstore-install-badges/badge_android_english-en.png/e9cd846dc748.png'
									alt='android App'
								/>
								<img
									src='https://www.instagram.com/static/images/appstore-install-badges/badge_ios_english-en.png/180ae7a0bcf7.png'
									alt='ios app'
								/>
							</div>
						</div>
					</div>
					<div class={styles.footerContainer}>
						<ul>
							{['About Us', 'Support', 'Jobs', 'Privacy', 'Terms', 'Profiles', 'Languages'].map(
								(elem) => {
									return (
										<>
											<li>
												<a href='#'>{elem}</a>
											</li>
										</>
									)
								}
							)}
						</ul>
					</div>
					<div class={styles.footerContainer}>
						<p>&copy; 2019 Complaints</p>
					</div>
				</>
			)}
		</>
	)
}

export default Login
