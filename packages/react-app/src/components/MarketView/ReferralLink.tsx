import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

import { ReactComponent as LinkIcon } from '@/assets/icons/link.svg'
import { getMarketUrl } from '@/lib/helpers'

const copyReferralLink = async (marketId: string, chainId: number, account: string) => {
	try {
		await navigator.clipboard.writeText(`${getMarketUrl(marketId, chainId)}?referralId=${account || ''}`)
	} catch (err) {
		alert('Unable to copy')
	}
}

function ReferralLink({ marketId, chainId }: { marketId: string; chainId: number }) {
	const { address } = useAccount()

	const [textCopied, setTextCopied] = useState(false)

	if (!navigator.clipboard) {
		return null
	}

	const clickHandler = async () => {
		if (!address) {
			// open
			alert(t`Connect your wallet`)
			return
		}

		setTextCopied(true)
		await copyReferralLink(marketId, chainId, address)
		setTimeout(() => setTextCopied(false), 3000)
	}

	if (textCopied) {
		return <Trans>Referral link copied!</Trans>
	}

	return (
		<span className='js-link' onClick={clickHandler}>
			<LinkIcon /> <Trans>Copy referral link</Trans>
		</span>
	)
}

export default ReferralLink
