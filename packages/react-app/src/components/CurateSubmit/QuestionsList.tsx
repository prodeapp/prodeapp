import * as React from 'react';
import {Question} from "../../graphql/subgraph";
import {UseFieldArrayReturn, useFormContext, useWatch} from "react-hook-form";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";
import {FORMAT_GROUPS} from "../../lib/curate";
import {CurateSubmitFormValues, ExtraDataGroups} from "./index";
import {useEffect, useState} from "react";
import Alert from "@mui/material/Alert";

export interface Props {
  useFieldArrayReturn: UseFieldArrayReturn<CurateSubmitFormValues, 'questions'>
  rawQuestions: Record<string, Question>
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
      <div>Group {group.name || (i+1)}</div>
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

export default function QuestionsList({useFieldArrayReturn, rawQuestions}: Props) {
  const { control } = useFormContext<CurateSubmitFormValues>();

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
    <div style={{width: format === FORMAT_GROUPS ? '50%' : '100%'}}>
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
                      <div style={{padding: '5px 0'}}>{rawQuestions[field.value].qTitle}</div>
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
      <GroupsPreview questions={useFieldArrayReturn.fields.map(f => rawQuestions[f.value].qTitle)} config={extraDataGroups} />
    </div>}
  </div>
}