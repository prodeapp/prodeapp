import { t } from '@lingui/macro'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import React from 'react'

import { useMarketStatus } from '@/hooks/useMarketStatus'
import { useSubmissionPeriodEnd } from '@/hooks/useSubmissionPeriodEnd'
import { getTimeLeft } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'

function MarketStatus({ marketId, chainId }: { marketId: Address; chainId: number }) {
	const { data: marketStatus } = useMarketStatus(marketId, chainId)
	const { data: submissionPeriodEnd = 0 } = useSubmissionPeriodEnd(marketId, chainId)
	const { locale } = useI18nContext()

	if (!marketStatus) {
		return <Skeleton />
	}

	if (marketStatus === 'ACCEPTING_BETS') {
		return <Chip label={t`Accepting bets`} color='success' />
	} else if (marketStatus === 'WAITING_ANSWERS') {
		return <Chip label={t`Waiting for results`} color='warning' />
	} else if (marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
		return <Chip label={t`Processing results`} color='warning' />
	} else if (marketStatus === 'WAITING_REGISTER_POINTS') {
		return (
			<Chip label={t`Prize distribution:` + ' ' + getTimeLeft(submissionPeriodEnd, false, locale)} color='warning' />
		)
	} else if (marketStatus === 'FINALIZED') {
		return <Chip label={t`Finished`} color='success' />
	}

	return null
}

export default MarketStatus
