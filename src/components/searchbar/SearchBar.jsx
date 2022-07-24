import React, { useState } from 'react'
import './SearchBar.scss'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { AuthContext } from '../../context/AuthContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid } from '@mui/material'
import { TextField } from '@mui/material'

function SearchBar({ placeholder, data }) {
	const [filteredData, setFilteredData] = useState([])
	const [wordEntered, setWordEntered] = useState('')
	const contextObj = useContext(AuthContext)
	let navigate = useNavigate()
	const handleFilter = (event) => {
		const searchWord = event.target.value
		setWordEntered(searchWord)
		const newFilter = data.filter((value) => {
			return value.fullname.toLowerCase().includes(searchWord.toLowerCase())
		})

		if (searchWord === '') {
			setFilteredData([])
		} else {
			setFilteredData(newFilter)
		}
	}

	const clearInput = () => {
		setFilteredData([])
		setWordEntered('')
	}

	const handleSearch = (user) => {
		contextObj.setVisitedUser(user)
		navigate('/visit/' + user.docId)
	}

	

	return (
		<Grid container className='search' sx={{ backgroundColor: 'background.paper' }}>
			<Grid position='relative' item className='searchInputs'>
				<TextField
					className='search-bar-text'
					label={placeholder}
					variant='filled'
					style={{}}
					value={wordEntered}
					onChange={handleFilter}
					size='small'
					width='25vw'
				/>
				<div className='searchIcon'>
					{filteredData.length === 0 ? <SearchIcon /> : <CloseIcon id='clearBtn' onClick={clearInput} />}
				</div>
				{filteredData.length !== 0 && (
					<Grid
						style={{
							position: 'absolute',
							bottom: 0,
							transform: 'translateY(100%)',
							backgroundColor:'white'
						}}
						item
						className={(contextObj.theme === 'dark' ? 'dark ' : '') + 'dataResult'}
					>
						{filteredData.map((value, key) => {
							let nameArr = value.fullname.split(' ')
							let tempUserName = ''
							nameArr.forEach((name) => {
								tempUserName = tempUserName + name.toLowerCase() + '_'
							})
							tempUserName = tempUserName + value.email.length
							return (
								<Grid className='dataResultItem' item onClick={() => handleSearch(value)}>
									<div className='dataResultItemLeft'>
										<img src={value.profileUrl} className='user-image' alt='' srcset='' />
									</div>

									<div className='dataResultItemRight'>
										<p className='head'>{value.fullname} </p>
										<p>{tempUserName}</p>
									</div>
								</Grid>
							)
						})}
					</Grid>
				)}
			</Grid>
		</Grid>
	)
}

export default SearchBar
