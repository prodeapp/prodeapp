import { Trans } from '@lingui/macro'
import { useTheme } from '@mui/material'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { Address } from '@wagmi/core'
import { formatEther } from 'ethers/lib/utils.js'
import React, { useEffect, useState } from 'react'

import { Response } from '@/graphql/subgraph'
import { useResponses } from '@/hooks/useResponses'
import { formatAmount } from '@/lib/helpers'

export function TabAllAnswers({ playerId, chainId }: { playerId: Address; chainId: number }) {
	return <TabAnswers playerId={playerId} chainId={chainId} pending={true} />
}

export function TabPendingAnswers({ playerId, chainId }: { playerId: Address; chainId: number }) {
	return <TabAnswers playerId={playerId} chainId={chainId} pending={true} />
}

function getBalanceInPendingAnswers(responses: Response[]): number {
	return responses.reduce((accumulator, response) => {
		return accumulator + Number(response.question.currentScheduledFinalizationTimestamp) <=
			Math.floor(Date.now() / 1000)
			? Number(formatEther(response.bond))
			: 0
	}, 0)
}
function TabAnswers({ playerId, chainId, pending }: { playerId: Address; chainId: number; pending?: boolean }) {
	const theme = useTheme()

	const { data: answers, error, isLoading } = useResponses({ playerId, chainId, pending })
	const [balanceInAnswers, setBalanceInAnswers] = useState<number | undefined>(undefined)

	useEffect(() => {
		if (answers) {
			setBalanceInAnswers(getBalanceInPendingAnswers(answers))
		}
	}, [answers])

	if (error) {
		return <Alert severity='error'>{error.message}</Alert>
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={150} />
	}

	if (!answers || answers.length === 0) {
		return (
			<Alert severity='error'>
				<Trans>No answers found.</Trans>
			</Alert>
		)
	}

	return (
		<div>
			<div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
				<div style={{ fontSize: 12 }}>
					<Trans>Balance in Answers Ongoing</Trans>:
				</div>
				<div style={{ fontSize: 30, fontWeight: 600, marginLeft: '10px' }}>
					{balanceInAnswers ? formatAmount(balanceInAnswers!, chainId) : <Skeleton />}
				</div>
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
								<Trans>Is Current Valid Answer?</Trans>:{' '}
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
