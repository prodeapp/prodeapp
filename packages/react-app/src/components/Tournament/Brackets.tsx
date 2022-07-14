import React, {useEffect, useRef, useState} from "react";
import { SingleEliminationBracket, DoubleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import {getSingleEliminationMatches, getDoubleEliminationMatches, getGSLMatches} from "../../lib/brackets";
import {Event} from "../../graphql/subgraph";
import {
  FORMAT_SINGLE_ELIMINATION,
  FORMAT_GSL,
  TournamentFormats
} from "../../lib/curate";
import Alert from "@mui/material/Alert";
import MatchPreview from "./MatchPreview";

type RenderBracketsProps = {
  events: Event[]
  width: number
  height: number
  type: TournamentFormats
  preview?: boolean
}

type BracketsProps = Pick<RenderBracketsProps, 'events' | 'type' | 'preview'>

function RenderBrackets({events, width, height, type, preview = false}: RenderBracketsProps) {

  try {
    if (type === FORMAT_GSL) {
      const matches = getGSLMatches(events);

      return <DoubleEliminationBracket
        matches={matches}
        matchComponent={preview ? MatchPreview : Match}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer width={width} height={height} {...props}>
            {children}
          </SVGViewer>
        )}
      />
    }

    if (type === FORMAT_SINGLE_ELIMINATION) {
      const matches = getSingleEliminationMatches(events);

      return <SingleEliminationBracket
        matches={matches}
        matchComponent={preview ? MatchPreview : Match}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer width={width} height={height} {...props}>
            {children}
          </SVGViewer>
        )}
      />
    }

    const matches = getDoubleEliminationMatches(events);

    return <DoubleEliminationBracket
      matches={matches}
      matchComponent={preview ? MatchPreview : Match}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer width={width} height={height} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  } catch (e: any) {
    return <Alert severity="error">{e?.message || 'Unexpected error'}</Alert>
  }

}

function Brackets({events, type, preview = false}: BracketsProps) {
  const [width, setWidth] = useState(0);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef || !elementRef.current) {
      return;
    }

    setWidth(elementRef.current.clientWidth);
  }, []);

  return (
    <div ref={elementRef} style={{background: '#FFF'}}>
      {events && <RenderBrackets events={events} width={width} height={700} type={type} preview={preview} />}
    </div>
  );
}

export default Brackets;
