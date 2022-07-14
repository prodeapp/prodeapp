import React, {useEffect, useRef, useState} from "react";
import { SingleEliminationBracket, DoubleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import {getSingleEliminationMatches, getDoubleEliminationMatches, getGSLMatches} from "../../lib/brackets";
import {Event} from "../../graphql/subgraph";
import {
  FORMAT_SINGLE_ELIMINATION,
  FORMAT_DOUBLE_ELIMINATION,
  FORMAT_GSL,
  DecodedCurateListFields
} from "../../lib/curate";
import Alert from "@mui/material/Alert";
import {useIndexedEvents} from "../../hooks/useEvents";

type RenderBracketsProps = {
  events: Event[]
  width: number
  height: number
  type: typeof FORMAT_SINGLE_ELIMINATION | typeof FORMAT_DOUBLE_ELIMINATION | typeof FORMAT_GSL
}

type BracketsProps = Pick<RenderBracketsProps, 'events' | 'type'>

function RenderBrackets({events, width, height, type}: RenderBracketsProps) {

  try {
    if (type === FORMAT_GSL) {
      const matches = getGSLMatches(events);

      return <DoubleEliminationBracket
        matches={matches}
        matchComponent={Match}
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
        matchComponent={Match}
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
      matchComponent={Match}
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

function Brackets({events, type}: BracketsProps) {
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
      {events && <RenderBrackets events={events} width={width} height={700} type={type} />}
    </div>
  );
}

export function BracketsFromList({events, itemJson}: {events: Event[], itemJson: DecodedCurateListFields['JASON']}) {
  const indexedEvents = useIndexedEvents(events);

  return <>{Object.keys(indexedEvents).length > 0 && itemJson && <div style={{marginTop: '20px'}}>
    {itemJson.formats.map((format: any, i: number) => {
      return <Brackets
        key={i}
        events={format.questions.map((event: string) => indexedEvents[event])}
        type={format.type} />
    })}
  </div>}
  </>
}

export default Brackets;
