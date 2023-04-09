import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Address } from '@wagmi/core'
import React, { useEffect, useState } from 'react'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { ReactComponent as ArrowRightIcon } from '@/assets/icons/arrow-right.svg'
import { TableBody, TableHeader } from '@/components'
import AnswerDialog from '@/components/Answer/AnswerDialog'
import { FormatEvent, FormatOutcome } from '@/components/FormatEvent'
import { Event } from '@/graphql/subgraph'
import { useEvents } from '@/hooks/useEvents'
import { usePhone } from '@/hooks/useResponsive'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress } from '@/lib/config'
import { getAnswerText, getTimeLeft, isFinalized } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'
import { queryClient } from '@/lib/react-query'
import { ANSWERED_TOO_SOON, encodeQuestionText, REALITY_TEMPLATE_MULTIPLE_SELECT } from '@/lib/reality'

const bigColumnSx = {
	width: { xs: '100%', md: '40%' },
	fontSize: { xs: '14px', md: '16px' },
	marginBottom: { xs: '10px', md: '0' },
	wordBreak: 'break-word',
}

const smallColumnsSx = {
	width: { xs: '50%', md: '30%' },
	fontSize: { xs: '13px', md: '16px' },
	display: 'inline-block',
	verticalAlign: 'top',
	wordBreak: 'break-word',
	textAlign: { xs: 'center', md: 'left' },
}

function StatusBadge({ color, children }: { color: 'red' | 'green' | 'yellow'; children: React.ReactNode }) {
	const colors = {
		red: ['#C42E2F', '#FFCCCC'],
		green: ['#0A7846', '#6AE8AF'],
		yellow: ['#FAD202', '#FAEA99'],
	}

	return (
		<div
			style={{
				fontSize: '14px',
				padding: '4px 12px',
				display: 'inline-flex',
				alignItems: 'center',
				fontWeight: 600,
				background: colors[color][1],
			}}
		>
			<div
				style={{
					height: '6.5px',
					width: '6.5px',
					borderRadius: '50%',
					backgroundColor: colors[color][0],
					marginRight: '10px',
				}}
			></div>
			{children}
		</div>
	)
}

function AnswerColumn(event: Event, finalized: boolean) {
	const { locale } = useI18nContext()

	const answerText = getAnswerText(event.answer, event.outcomes || [], event.templateID)

	if (finalized) {
		if (event.answer === ANSWERED_TOO_SOON) {
			return <StatusBadge color='yellow'>{answerText}</StatusBadge>
		}

		return (
			<div>
				<StatusBadge color='green'>
					<FormatOutcome name={answerText} title={event.title} />
				</StatusBadge>
				<div style={{ fontSize: '11.11px', marginTop: '5px' }}>
					<Trans>Answer accepted</Trans>
				</div>
			</div>
		)
	}

	const openingTimeLeft = getTimeLeft(event.openingTs, false, locale)

	if (openingTimeLeft !== false) {
		return (
			<div>
				<StatusBadge color='red'>
					<Trans>Pending</Trans>
				</StatusBadge>
				<div style={{ fontSize: '11.11px', marginTop: '5px' }}>
					<Trans>Open to answers in {openingTimeLeft}</Trans>
				</div>
			</div>
		)
	}

	if (event.isPendingArbitration) {
		return (
			<StatusBadge color='yellow'>
				<Trans>Pending arbitration</Trans>
			</StatusBadge>
		)
	}

	const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp, false, locale)

	if (!answerCountdown) {
		return (
			<StatusBadge color='yellow'>
				<Trans>Pending</Trans>
			</StatusBadge>
		)
	}

	return (
		<div>
			<StatusBadge color='yellow'>{answerText}</StatusBadge>
			<div style={{ fontSize: '11.11px', marginTop: '5px' }}>
				<Trans>Answer closes in {answerCountdown}</Trans>
			</div>
		</div>
	)
}

function ActionColumn(event: Event, chainId: number, finalized: boolean, clickHandler: () => void) {
	const { locale } = useI18nContext()

	const { isSuccess, write, error } = useSendRecklessTx({
		address: getConfigAddress('REALITIO', chainId),
		abi: RealityAbi,
		functionName: 'reopenQuestion',
	})

	useEffect(() => {
		if (error) {
			alert(error.message)
		}
	}, [error])

	if (finalized) {
		if (event.answer === ANSWERED_TOO_SOON) {
			const reopenQuestion = async () => {
				write!({
					recklesslySetUnpreparedArgs: [
						BigNumber.from(event.templateID),
						encodeQuestionText(
							event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? 'multiple-select' : 'single-select',
							event.title,
							event.outcomes,
							event.category,
							'en_US'
						),
						event.arbitrator,
						event.timeout,
						event.openingTs,
						BigNumber.from(0),
						event.minBond,
						event.id,
					],
				})
			}

			if (isSuccess) {
				// TODO: update event in cache to allow to answer instantly
				return (
					<div>
						<Trans>Question reopened!</Trans>
					</div>
				)
			}

			return (
				<Button color='primary' size='small' onClick={reopenQuestion}>
					<Trans>Reopen question</Trans>
				</Button>
			)
		}

		return null
	}

	const openingTimeLeft = getTimeLeft(event.openingTs, false, locale)

	if (openingTimeLeft !== false) {
		return null
	}

	return (
		<span className='js-link' onClick={clickHandler}>
			{event.answer === null ? <Trans>Answer result</Trans> : <Trans>Change result</Trans>}
			<ArrowRightIcon style={{ marginLeft: '10px' }} />
		</span>
	)
}

export default function Results({ marketId, chainId }: { marketId: Address; chainId: number }) {
	const { data: events } = useEvents(marketId, chainId)
	const [currentEvent, setCurrentEvent] = useState<Event | undefined>()
	const [openModal, setOpenModal] = useState(false)
	const isPhone = usePhone()

	const handleClose = async () => {
		if (currentEvent) {
			// invalidate queries just in case the user has provided an answer
			queryClient.invalidateQueries(['useMarket', marketId])
			queryClient.invalidateQueries(['useBets', { marketId }])
			queryClient.invalidateQueries(['useEvents', { marketId }])
		}
		setOpenModal(false)
	}

	if (!events || events.length === 0) {
		return (
			<Alert severity='error'>
				<Trans>The events of this market are still being processed.</Trans>
			</Alert>
		)
	}

	return (
		<>
			{currentEvent && <AnswerDialog open={openModal} handleClose={handleClose} event={currentEvent} />}
			<div>
				{!isPhone && (
					<TableHeader>
						<div style={{ width: '40%' }}>
							<Trans>Event</Trans>
						</div>
						<div style={{ width: '30%' }}>
							<Trans>Result</Trans>
						</div>
						<div style={{ width: '30%' }}></div>
					</TableHeader>
				)}
				{events &&
					events.map((event, i) => {
						const finalized = isFinalized(event)

						return (
							<TableBody key={i} className='padding-lg'>
								<div style={{ width: '100%' }}>
									<Box
										sx={{
											display: { md: 'flex' },
											alignItems: 'center',
											width: '100%',
											fontWeight: 'normal',
										}}
									>
										<Box sx={bigColumnSx}>
											<FormatEvent title={event.title} />
										</Box>
										<Box sx={smallColumnsSx}>{AnswerColumn(event, finalized)}</Box>
										<Box sx={smallColumnsSx}>
											{ActionColumn(event, chainId, finalized, () => {
												setCurrentEvent(event)
												setOpenModal(true)
											})}
										</Box>
									</Box>
								</div>
							</TableBody>
						)
					})}
			</div>
		</>
	)
}
