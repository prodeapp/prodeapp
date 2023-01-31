import { MatchComponentProps } from '@g-loot/react-tournament-brackets/dist/src/types';
import React from 'react';

import { Side, StyledMatch, Team, Wrapper } from './styles';

function MatchPreview({
	/*bottomHovered,
	bottomParty,
	bottomText,
	bottomWon,*/
	match,
}: /*onMatchClick,
	onMouseEnter,
	onMouseLeave,
	onPartyClick,
	topHovered,
	topParty,
	topText,
	topWon,*/
MatchComponentProps) {
	return (
		<Wrapper>
			<StyledMatch>
				<Side>
					<Team>{match.eventTitle}</Team>
				</Side>
			</StyledMatch>
		</Wrapper>
	);
}

export default MatchPreview;
