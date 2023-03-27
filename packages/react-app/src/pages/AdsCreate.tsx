import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useNetwork } from 'wagmi'

import { SVGFactoryAbi } from '@/abi/SVGFactory'
import { FormError, FormLabel, FormRow } from '@/components'
import { AdImg } from '@/components/ImgSvg'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { useSVGAdFactoryDeposit } from '@/hooks/useSVGFactoryDeposit'
import { getConfigAddress, isMainChain } from '@/lib/config'

import { Banner } from './MarketsCreate'

const VALID_EXTENSIONS = {
	svg: 'image/svg+xml',
	png: 'image/png',
	jpeg: 'image/jpeg',
}

const IMAGE_DIMENSION = { width: 290, height: 430 }

interface AdCreateFormValues {
	url: string
}

const getImageDimensions = async (file: File) => {
	const img = new Image()
	const _URL = window.URL || window.webkitURL

	const objectUrl = _URL.createObjectURL(file)

	const promise = new Promise<{ width: number; height: number }>((resolve, reject) => {
		img.onload = () => {
			_URL.revokeObjectURL(objectUrl)
			resolve({ width: img.naturalWidth, height: img.naturalHeight })
		}

		img.onerror = reject
	})

	img.src = objectUrl

	return promise
}

const getImageResult = async (file: File) => {
	return new Promise<string | ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = function (e) {
			const result = e?.target?.result || ''

			if (result === '') {
				reject()
			}

			resolve(result)
		}

		reader.onerror = reject

		reader.readAsDataURL(file)
	})
}

const wrapSvg = async (file: File) => {
	const result = await getImageResult(file)

	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${IMAGE_DIMENSION.width}" height="${IMAGE_DIMENSION.height}">
<image width="${IMAGE_DIMENSION.width}" height="${IMAGE_DIMENSION.height}" xlink:href="${result}"></image></svg>`
}

const isValidUrl = (url: string) => {
	try {
		new URL(url)
	} catch (e) {
		return false
	}
	return true
}

function AdsCreate() {
	const [svg, setSvg] = useState('')
	const [svgError, setSvgError] = useState('')

	const { address } = useAccount()
	const { chain } = useNetwork()

	const { isSuccess, isLoading, error, write } = useSendRecklessTx({
		address: getConfigAddress('SVG_AD_FACTORY', chain?.id),
		abi: SVGFactoryAbi,
		functionName: 'createAd',
	})

	const { data: baseDeposit } = useSVGAdFactoryDeposit()

	const { register, handleSubmit, formState } = useForm<AdCreateFormValues>({
		mode: 'all',
		defaultValues: {
			url: '',
		},
	})

	const { errors, isValid } = formState

	if (!address) {
		return <Alert severity='error'>{i18n._('Connect your wallet to create an ad.')}</Alert>
	}

	if (!chain || chain.unsupported) {
		return <Alert severity='error'>{i18n._('UNSUPPORTED_CHAIN')}</Alert>
	}

	if (!isMainChain(chain?.id)) {
		return (
			<Alert severity='error'>
				<Trans id='ONLY_MAIN_CHAIN' />
			</Alert>
		)
	}

	const onSubmit = async (data: AdCreateFormValues) => {
		write!({
			recklesslySetUnpreparedArgs: [btoa(svg), data.url],
			recklesslySetUnpreparedOverrides: {
				value: baseDeposit,
			},
		})
	}

	const fileChangedHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) {
			setSvgError('Empty file')
			setSvg('')
			return false
		}

		const file = event.target.files[0]

		if (!Object.values(VALID_EXTENSIONS).includes(file.type)) {
			setSvgError('File type not supported. Must be svg, png or jpg.')
			setSvg('')
			return false
		}

		const { height, width } = await getImageDimensions(file)

		if (height !== IMAGE_DIMENSION.height || width !== IMAGE_DIMENSION.width) {
			setSvgError('Image dimension must be 290x430')
			setSvg('')
			return false
		}

		const _svg = await wrapSvg(file)

		if (_svg.length > 1024 * 10) {
			setSvgError('SVG size must be lower than 10 KB')
			setSvg('')
			return false
		}

		setSvgError('')
		setSvg(_svg)
	}

	return (
		<div>
			<Banner
				style={{
					backgroundImage: 'url(/banners/banner-3.jpg)',
					marginBottom: '50px',
				}}
			>
				<Typography variant='h1s'>
					<Trans id='Create a new ad' />
				</Typography>
			</Banner>

			<Container>
				{isSuccess && (
					<Alert severity='success'>
						<Trans id='Ad created.' />
					</Alert>
				)}

				{isLoading && (
					<div style={{ textAlign: 'center', marginBottom: 15 }}>
						<CircularProgress />
					</div>
				)}

				{!isSuccess && !isLoading && (
					<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: '675px' }}>
						{error && (
							<Alert severity='error' sx={{ mb: 2 }}>
								{error.message}
							</Alert>
						)}
						<FormRow>
							<FormLabel>
								<Trans id='Image' />
							</FormLabel>
							<div style={{ width: '100%' }}>
								<input
									name='file'
									id='contained-button-file'
									type='file'
									style={{ display: 'none' }}
									onChange={fileChangedHandler}
								/>
								<label htmlFor='contained-button-file'>
									<Button variant='contained' color='primary' component='span'>
										Upload
									</Button>
								</label>
								{svgError !== '' && (
									<Alert severity='error' sx={{ mt: 2 }}>
										{svgError}
									</Alert>
								)}
							</div>
						</FormRow>

						<FormRow>
							<FormLabel>URL</FormLabel>
							<div>
								<TextField
									{...register('url', {
										required: i18n._('This field is required.'),
										validate: (v) => isValidUrl(v) || i18n._('Invalid URL'),
									})}
									error={!!errors.url}
									style={{ width: '100%' }}
								/>
								<FormError>
									<ErrorMessage errors={errors} name='url' />
								</FormError>
							</div>
						</FormRow>

						<FormRow>
							The ad must follow the{' '}
							<a
								href='https://ipfs.kleros.io/ipfs/QmeycGJx3HUBjC3cbgtKqfgD6N4eZtZDn8tmCuJZPMVrQt/ad-content-curation-policy.pdf'
								target='_blank'
								rel='noopener noreferrer'
							>
								Ad Content Moderation Policy
							</a>
						</FormRow>

						{isValid && svg && (
							<>
								<div style={{ textAlign: 'center', marginBottom: '30px' }}>
									<AdImg svg={svg} type='svg' width={290} />
								</div>
								<div style={{ marginBottom: '20px' }}>
									<Button type='submit' fullWidth size='large'>
										<Trans id='Submit Ad' />
									</Button>
								</div>
							</>
						)}
					</form>
				)}
			</Container>
		</div>
	)
}

export default AdsCreate
