import * as React from 'react';
import {Event} from "../../graphql/subgraph";
import {UseFieldArrayReturn, useFormContext, useWatch} from "react-hook-form";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";
import {FORMAT_GROUPS, FORMAT_SINGLE_ELIMINATION} from "../../lib/curate";
import {CurateSubmitFormValues, ExtraDataGroups} from "./index";
import {useEffect, useMemo, useState} from "react";
import Alert from "@mui/material/Alert";

export interface Props {
  useFieldArrayReturn: UseFieldArrayReturn<CurateSubmitFormValues, 'questions'>
  events: Event[]
}

function GroupsPreview({questions, config}: {questions: string[], config: ExtraDataGroups}) {
  const [sizeCount, setSizeCount] = useState(0);

  useEffect(() => {
    setSizeCount(
      config.groups.map((group) => Number(group.size)).reduce((partialSum, a) => partialSum + a, 0)
    );
  }, [config]);

  if (sizeCount !== questions.length) {
    return <Alert severity="error">The sum of group sizes must be equal to the amount of events.</Alert>
  }

  let t = 0;

  return <>{config.groups.map((group, i) => {
    return <div style={{border: '1px solid #fff', padding: '5px', marginBottom: '10px'}} key={i}>
      <div>{group.name || `Group ${i+1}`}</div>
      <div style={{padding: '5px 10px'}}>
        {Array.from({length: group.size}, (_, i) => i + 1).map(j => {
          const n = t++;
          if (!questions[n]) {
            return null
          }
          return <div style={{padding: '5px 0'}} key={j}>{questions[n]}</div>
        })}
      </div>
    </div>
  })}</>
}

function EliminationPreview({questions}: {questions: string[]}) {
  const getConfig = (totalEvents: number): ExtraDataGroups => {
    let n = 0;
    let accumEvents = Math.pow(2, n);
    let currentEvents = accumEvents;

    const config: ExtraDataGroups = {groups: [], rounds: 1};

    while(accumEvents <= totalEvents) {
      config.groups.unshift({size: currentEvents, name: ''});

      if ((accumEvents + 1) === totalEvents) {
        // third place match
        config.groups.push({size: 1, name: 'Third place'})
      }

      n++;
      currentEvents = Math.pow(2, n);
      accumEvents += currentEvents;
    }

    config.groups = config.groups.map((group, n) => {
      if (group.name === '') {
        group.name = `Round ${n+1}`
      }
      return group;
    })

    return config;
  }

  return <GroupsPreview questions={questions} config={getConfig(questions.length)} />
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
      <h3 style={{marginBottom: '30px'}}>Drag and drop each question to the correct position</h3>
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
      <GroupsPreview questions={useFieldArrayReturn.fields.map(f => indexedEvents[f.value].title)} config={extraDataGroups} />
    </div>}
    {format === FORMAT_SINGLE_ELIMINATION && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}>Single-Elimination preview</h3>
      <EliminationPreview questions={useFieldArrayReturn.fields.map(f => indexedEvents[f.value].title)} />
    </div>}
  </div>
}