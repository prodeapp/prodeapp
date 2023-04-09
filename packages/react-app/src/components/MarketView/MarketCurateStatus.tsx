import { Trans } from '@lingui/macro'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

import { ReactComponent as ShieldCheckIcon } from '@/assets/icons/shield-check.svg'
import { ReactComponent as TriangleIcon } from '@/assets/icons/triangle-right.svg'
import { CurateItem } from '@/graphql/subgraph'
import { useCurateItems } from '@/hooks/useCurateItems'
import { getConfigAddress } from '@/lib/config'

function getActiveItem(curateItems?: CurateItem[]) {
	if (!curateItems || curateItems.length === 0) {
		return null
	}

	// check for registered items
	const registeredItems = curateItems.filter((item) => item.status === 'Registered')

	if (registeredItems.length > 0) {
		return registeredItems[0]
	}

	// check for pending items
	const pendingItems = curateItems.filter(
		(item) => item.status === 'RegistrationRequested' || item.status === 'ClearingRequested'
	)

	if (pendingItems.length > 0) {
		return pendingItems[0]
	}

	return null
}

function MarketCurateStatus({
	marketHash,
	marketId,
	chainId,
}: {
	marketHash: string
	marketId: string
	chainId: number
}) {
	const { data: curateItems, error, isLoading } = useCurateItems(marketHash)
	const theme = useTheme()

	if (error) {
		return null
	}

	if (isLoading) {
		return <Skeleton animation='wave' height={'60px'} />
	}

	const activeItem = getActiveItem(curateItems)

	if (activeItem !== null && activeItem.status === 'Registered') {
		return (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<div>
					<Trans>Verified</Trans>
				</div>
				<ShieldCheckIcon width='12' height='13' style={{ marginLeft: 5 }} />
			</div>
		)
	}

	return (
		<div style={{ display: 'flex' }}>
			{activeItem === null || activeItem.status === 'Absent' ? (
				<div>
					<Trans>Not verified yet</Trans>
				</div>
			) : (
				<a
					href={
						'https://curate.kleros.io/tcr/100/' + getConfigAddress('CURATE_REGISTRY', chainId) + '/' + activeItem.id
					}
					target='_blank'
					rel='noreferrer'
				>
					<Trans>In process</Trans>
				</a>
			)}
			<div
				style={{
					borderLeft: '1px solid #303030',
					paddingLeft: '10px',
					marginLeft: '10px',
				}}
			>
				<RouterLink to={`/curate/submit/${marketId}`}>
					<Trans>Verify</Trans>{' '}
					<TriangleIcon
						style={{
							marginLeft: 5,
							fill: 'currentColor',
							color: theme.palette.primary.main,
						}}
					/>
				</RouterLink>
			</div>
		</div>
	)
}

export default MarketCurateStatus
