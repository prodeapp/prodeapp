import {Event} from "../../graphql/subgraph";
import {parseEliminationConfig} from "../../lib/brackets";
import Alert from "@mui/material/Alert";
import * as React from "react";
import {ExtraDataGroups} from "../../lib/curate";

export function Groups({events, config}: {events: Event[], config: ExtraDataGroups}) {
  try {
    const parsedConfig = parseEliminationConfig(events, config);

    return <>{parsedConfig.map((group, i) => {
      return <div style={{border: '1px solid #fff', padding: '5px', marginBottom: '10px'}} key={i}>
        <div>{group.name || `Group ${i+1}`}</div>
        <div style={{padding: '5px 10px'}}>
          {group.events.map(event => {
            return <div style={{padding: '5px 0'}} key={event.id}>{event.title}</div>
          })}
        </div>
      </div>
    })}</>
  } catch (e: any) {
    return <Alert severity="error">{e?.message || 'Unexpected error'}</Alert>
  }
}
