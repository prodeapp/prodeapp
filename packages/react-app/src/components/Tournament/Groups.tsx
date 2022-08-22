import {Event} from "../../graphql/subgraph";
import {parseEliminationConfig} from "../../lib/brackets";
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import * as React from "react";
import {ExtraDataGroups} from "../../lib/curate";
import {FormatEvent} from "../FormatEvent";

export function Groups({events, config}: {events: Event[], config: ExtraDataGroups}) {
  try {
    const parsedConfig = parseEliminationConfig(events, config);

    return <Grid container spacing={3}>{parsedConfig.map((group, i) => {
      return <Grid item xs={12} md={6} xl={4}>
        <div style={{border: '1px solid #303030', padding: '15px', marginBottom: '10px'}} key={i}>
          <Typography variant="h6s" sx={{fontWeight: 700}}>{group.name || `Group ${i+1}`}</Typography>
          <div style={{padding: '5px 10px'}}>
            {group.events.map(event => {
              return <div style={{padding: '5px 0'}} key={event.id}><FormatEvent title={event.title} /></div>
            })}
          </div>
        </div>
      </Grid>
    })}</Grid>
  } catch (e: any) {
    return <Alert severity="error">{e?.message || 'Unexpected error'}</Alert>
  }
}
