import { createTheme } from '@mui/material'

const lightTheme = createTheme({
	palette: {
		background: {
			default: '#f6f6fa',
			paper: '#ffffff',
		},
		text: {
			primary: '#000000',
			secondary: '#989899',
		},
		primary: {
			main: '#007aff',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#ff9800',
			contrastText: '#ffffff',
		},
		success: {
			main: '#1b5e20',
			contrastText: '#ffffff',
		},
		error: {
			main: '#b71c1c',
			contrastText: '#ffffff',
		},
	},
})

const darkTheme = createTheme({
	palette: {
		background: {
			default: '#0a1720',
			paper: '#0f212f',
		},
		text: {
			primary: '#ffffff',
			secondary: '#fafafa',
		},
		primary: {
			main: '#007aff',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#ff9800',
			contrastText: '#ffffff',
		},
		success: {
			main: '#1b5e20',
			contrastText: '#ffffff',
		},
		error: {
			main: '#b71c1c',
			contrastText: '#ffffff',
		},
	},
})

export { lightTheme, darkTheme }
