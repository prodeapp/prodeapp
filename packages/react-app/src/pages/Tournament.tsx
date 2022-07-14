import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useEvents} from "../hooks/useEvents";
import { SingleEliminationBracket, DoubleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import {getSingleEliminationMatches, getDoubleEliminationMatches, getGSLMatches} from "../lib/brackets";
import {Event} from "../graphql/subgraph";
import {FORMAT_SINGLE_ELIMINATION, FORMAT_DOUBLE_ELIMINATION, FORMAT_GSL} from "../lib/curate";
import Alert from "@mui/material/Alert";

type Props = {
  events: Event[]
  width: number
  height: number
  type: typeof FORMAT_SINGLE_ELIMINATION | typeof FORMAT_DOUBLE_ELIMINATION | typeof FORMAT_GSL
}

function RenderBrackets({events, width, height, type}: Props) {

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

function Tournament() {
  const { id } = useParams();
  const { isLoading, data: events } = useEvents(String(id));

  const [width, setWidth] = useState(0);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef || !elementRef.current) {
      return;
    }

    setWidth(elementRef.current.clientWidth);
  }, []);

  return (
    <div ref={elementRef}>
      {isLoading && <div>Loading...</div>}
      {events && <RenderBrackets events={events} width={width} height={700} type={FORMAT_SINGLE_ELIMINATION} />}
    </div>
  );
}

export default Tournament;
