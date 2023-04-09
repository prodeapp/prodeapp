import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import * as React from 'react'
import { useState } from 'react'

type ImgSvgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	svg: string
}

/**
 * Using an IMG tag is the safest way to load untrusted SVG files and prevent XSS attacks.
 */
function ImgSvg({ svg, alt, ...rest }: ImgSvgProps) {
	if (!svg.includes('xmlns')) {
		svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
	}

	return <ImgSvgBase64 svg={btoa(svg)} alt={alt || ''} {...rest} />
}

function ImgSvgBase64({ svg, alt, ...rest }: ImgSvgProps) {
	return <img src={`data:image/svg+xml;base64,${svg}`} alt={alt || ''} {...rest} />
}

export function AdImg(props: ImgSvgProps & { type: 'svg' | 'base64' }) {
	const [error, setError] = useState(false)

	if (error) {
		return (
			<Alert severity='error'>
				<Trans>Failed to load image.</Trans>
			</Alert>
		)
	}

	const onError = () => setError(true)

	const ImgComponent = props.type === 'base64' ? ImgSvgBase64 : ImgSvg

	return <ImgComponent {...props} onError={onError} />
}
