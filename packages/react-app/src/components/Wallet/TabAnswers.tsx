import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import React from 'react'

import { Response } from '@/graphql/subgraph'
import { useEventsResponses } from '@/hooks/useEventsResponses'
import { formatAmount } from '@/lib/helpers'

export function TabPendingAnswers({ playerId, chainId }: { playerId: Address; chainId: number }) {
	return <TabAnswers playerId={playerId} chainId={chainId} pending={true} />
}

function getBalanceInPendingAnswers(responses: Response[]): BigNumber {
	return responses.reduce((accumulator, response) => {
		if (Number(response.question.currentScheduledFinalizationTimestamp) > Math.floor(Date.now() / 1000)) {
			accumulator = accumulator.add(response.bond)
		}

		return accumulator
	}, BigNumber.from(0))
}

function TabAnswers({ playerId, chainId, pending }: { playerId: Address; chainId: number; pending?: boolean }) {
	const theme = useTheme()

	const { data: answers = [], error, isLoading } = useEventsResponses({ playerId, chainId, pending })

	const balanceInAnswers = getBalanceInPendingAnswers(answers)

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (answers.length === 0) {
		return (
			<Alert severity='info'>
				<Trans>We have nott found pending answers</Trans>
			</Alert>
		)
	}

	return (
		<div>
			<div>
				<div style={{ fontSize: 12 }}>
					<Trans>Balance in ongoing answers</Trans>
				</div>
				<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(balanceInAnswers, chainId)}</div>
			</div>
			{answers.map((answer) => {
				return (
					<Box
						key={answer.id}
						sx={{ mb: '5px', borderBottom: `1px solid ${theme.palette.secondary.dark}`, p: 1, borderRadius: 1 }}
					>
						<div
							style={{
								width: '100%',
								fontSize: '16px',
								fontWeight: '600',
							}}
						>
							{answer.question.qTitle}
						</div>
						<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
							<div>
								<Trans>Is current answer?</Trans>:{' '}
								<b>{answer.question.currentAnswer === answer.answer ? 'Yes' : 'No'}</b>
							</div>
							<div>
								<Trans>Bond</Trans>: <b>{formatAmount(answer.bond, chainId)}</b>
							</div>
							<div>
								<Trans>Status</Trans>:{' '}
								<b>
									{Number(answer.question.currentScheduledFinalizationTimestamp) <= Math.floor(Date.now() / 1000)
										? 'Resolved'
										: 'Ongoing'}
								</b>
							</div>
						</div>
					</Box>
				)
			})}
		</div>
	)
}
