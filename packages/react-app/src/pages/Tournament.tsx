import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useEvents} from "../hooks/useEvents";
import { SingleEliminationBracket, DoubleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import {getSingleEliminationMatches, getDoubleEliminationMatches} from "../lib/brackets";
import {Event} from "../graphql/subgraph";
import {FORMAT_SINGLE_ELIMINATION, FORMAT_DOUBLE_ELIMINATION} from "../lib/curate";

function RenderBrackets({events, width, height, type}: {events: Event[], width: number, height: number, type: typeof FORMAT_SINGLE_ELIMINATION | typeof FORMAT_DOUBLE_ELIMINATION}) {

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
