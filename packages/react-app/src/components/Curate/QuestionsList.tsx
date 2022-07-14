import * as React from 'react';
import {Event} from "../../graphql/subgraph";
import {UseFieldArrayReturn, useFormContext, useWatch} from "react-hook-form";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";
import {FORMAT_DOUBLE_ELIMINATION, FORMAT_GROUPS, FORMAT_GSL, FORMAT_SINGLE_ELIMINATION} from "../../lib/curate";
import {CurateSubmitFormValues, ExtraDataGroups} from "./index";
import {useMemo} from "react";
import Alert from "@mui/material/Alert";
import { Trans } from '@lingui/macro';
import {
  getDoubleEliminationConfig,
  getEliminationConfig,
  getGSLConfig,
  parseEliminationConfig
} from "../../lib/brackets";

export interface Props {
  useFieldArrayReturn: UseFieldArrayReturn<CurateSubmitFormValues, 'questions'>
  events: Event[]
}

function GroupsPreview({events, config}: {events: Event[], config: ExtraDataGroups}) {
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

function EliminationPreview({events, type}: {events: Event[], type: 'single'|'double'|'gsl'}) {

  if (type === 'gsl') {
    return <GroupsPreview events={events} config={getGSLConfig()} />
  }

  if (type === 'single') {
    return <GroupsPreview
            events={events}
            config={getEliminationConfig(events.length, ['Final', 'Semifinals', 'Quarterfinals'], '', true)} />
  }

  try {
    const brackets = getDoubleEliminationConfig(events);

    return <>
      {brackets.map((bracket, i) => <GroupsPreview events={bracket.questions} config={bracket.config} key={i} />)}
    </>
  } catch (e: any) {
    return <Alert severity="error">{e?.message || 'Unexpected error'}</Alert>
  }
}

export default function QuestionsList({useFieldArrayReturn, events}: Props) {
  const { control } = useFormContext<CurateSubmitFormValues>();

  const indexedEvents: Record<string, Event> = useMemo(() => {
    return events.reduce((obj, event) => {
      return {...obj, [event.id]: event}
    }, {})
  }, [events]);

  const format = useWatch({control, name: 'format'});
  const extraDataGroups = useWatch({control, name: 'extraDataGroups'});

  const handleFieldDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    useFieldArrayReturn.move(source.index, destination.index);
  }

  return <div style={{display: 'flex'}}>
    <div style={{width: format === FORMAT_GROUPS || format === FORMAT_SINGLE_ELIMINATION ? '50%' : '100%'}}>
      <h3 style={{marginBottom: '30px'}}><Trans>Drag and drop each question to the correct position</Trans></h3>
      <DragDropContext onDragEnd={handleFieldDragEnd}>
        <Droppable droppableId="panel-dropzone">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="panels-wrapper"
            >
              {useFieldArrayReturn.fields.map((field, index) => (
                <Draggable draggableId={field.id} index={index} key={field.id}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="panel"
                    >
                      <div style={{padding: '5px 0'}}>{indexedEvents[field.value].title}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
    {format === FORMAT_GROUPS && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}>Groups preview</h3>
      <GroupsPreview events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} config={extraDataGroups} />
    </div>}
    {format === FORMAT_SINGLE_ELIMINATION && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}>Single-Elimination preview</h3>
      <EliminationPreview events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} type="single" />
    </div>}
    {format === FORMAT_DOUBLE_ELIMINATION && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}>Double-Elimination preview</h3>
      <EliminationPreview events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} type="double"/>
    </div>}
    {format === FORMAT_GSL && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}>GSL preview</h3>
      <EliminationPreview events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} type="gsl"/>
    </div>}
  </div>
}