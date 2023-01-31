import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import Carousel from 'nuka-carousel'
import React from 'react'

const Slide = styled('div')(({ theme }) => ({
	height: '368px',
	padding: '50px',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	[theme.breakpoints.up('sm')]: {
		paddingLeft: '8.33%',
	},
}))

export default function HomeSlider() {
	return (
		<div>
			<Carousel
				renderCenterLeftControls={() => null}
				renderCenterRightControls={() => null}
				autoplay={true}
				autoplayReverse={true}
			>
				<Slide style={{ backgroundImage: 'url(/banners/banner-1.jpg)' }}>
					<div style={{ fontSize: '16px', marginBottom: '10px' }}>Uncensorable and KYC-free</div>
					<Typography variant='h1'>
						Truly decentralized <br />
						betting platform
					</Typography>
				</Slide>
				<Slide
					style={{
						backgroundImage: 'url(/banners/banner-2.jpg)',
						color: '#FFF',
					}}
				>
					<div style={{ fontSize: '16px', marginBottom: '10px' }}>More tournaments</div>
					<Typography variant='h1' style={{ marginBottom: '20px' }}>
						betting modes and <br />
						prizes are coming
					</Typography>
					<div>
						<Button
							component={Link}
							variant='outlined'
							size='large'
							href='https://twitter.com/prode_eth'
							target='_blank'
							rel='noopener'
						>
							Follow us on Twitter
						</Button>
					</div>
				</Slide>
			</Carousel>
		</div>
	)
}
