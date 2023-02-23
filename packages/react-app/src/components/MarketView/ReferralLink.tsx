import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

import { ReactComponent as LinkIcon } from '@/assets/icons/link.svg'
import { getMarketUrl } from '@/lib/helpers'

const copyReferralLink = async (marketId: string, account: string) => {
	try {
		await navigator.clipboard.writeText(`${getMarketUrl(marketId)}?referralId=${account || ''}`)
	} catch (err) {
		alert('Unable to copy')
	}
}

function ReferralLink({ marketId }: { marketId: string }) {
	const { address } = useAccount()

	const [textCopied, setTextCopied] = useState(false)

	if (!navigator.clipboard) {
		return null
	}

	const clickHandler = async () => {
		if (!address) {
			// open
			alert(i18n._('Connect your wallet'))
			return
		}

		setTextCopied(true)
		await copyReferralLink(marketId, address)
		setTimeout(() => setTextCopied(false), 3000)
	}

	if (textCopied) {
		return <Trans id='Referral link copied!' />
	}

	return (
		<span className='js-link' onClick={clickHandler}>
			<LinkIcon /> <Trans id='Copy referral link' />
		</span>
	)
}

export default ReferralLink
