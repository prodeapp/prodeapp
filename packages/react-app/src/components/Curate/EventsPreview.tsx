import * as React from 'react';
import {Event} from "../../graphql/subgraph";
import {UseFieldArrayReturn, useFormContext, useWatch} from "react-hook-form";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";
import {convertExtraDataGroups, FORMAT_GROUPS} from "../../lib/curate";
import {CurateSubmitFormValues} from "./index";
import {useIndexedEvents} from "../../hooks/useEvents";
import Brackets from "../Tournament/Brackets";
import {Groups} from "../Tournament/Groups";
import { Trans } from "@lingui/macro";

export interface Props {
  useFieldArrayReturn: UseFieldArrayReturn<CurateSubmitFormValues, 'questions'>
  events: Event[]
}

export default function EventsPreview({useFieldArrayReturn, events}: Props) {
  const { control } = useFormContext<CurateSubmitFormValues>();

  const indexedEvents = useIndexedEvents(events);

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

  return <div>
    <div style={{marginBottom: '20px'}}>
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
                      <div style={{padding: '5px 0'}}>{indexedEvents[field.value]?.title || '-'}</div>
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
    {format === FORMAT_GROUPS && <div>
      <Groups events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} config={convertExtraDataGroups(extraDataGroups)} />
    </div>}
    {format !== FORMAT_GROUPS && <div>
      <Brackets events={useFieldArrayReturn.fields.map(f => indexedEvents[f.value])} type={format} preview={true}/>
    </div>}
  </div>
}