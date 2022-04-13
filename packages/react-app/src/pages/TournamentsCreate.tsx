import React, {useEffect, useState} from "react";
import {Input, Button, Box, BoxRow, BoxLabelCell, BoxTitleCell, AlertError, AnswerFieldWrapper, AnswerField} from "../components"
import {Control, useFieldArray, useForm, useWatch} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";

const PLACEHOLDER_REGEX = /\$\d/g

type AnswersPlaceholder = {value: string}[];
type QuestionParams = {value: string}[];

type MatchBuilderProps = {
  matchIndex: number
  removeMatch: (i: number) => void
  placeholdersCount: number
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
}

type FormValues = {
  questionPlaceholder: string
  matches: {questionParams: QuestionParams}[]
  answersPlaceholder: AnswersPlaceholder
}

type AnswersBuilderProps = {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
}

type MatchData = {
  question: string
  answers: string[]
}

function replacePlaceholders(text: string, questionParams: string[]) {
  let n = 0;

  return text.replace(
    PLACEHOLDER_REGEX,
    (match) => {
      return questionParams[n++] || match;
    }
  )
}

function getMatchData(questionParams: QuestionParams, questionPlaceholder: string, answersPlaceholder: AnswersPlaceholder): MatchData {
  return {
    question: replacePlaceholders(questionPlaceholder, questionParams.map(qp => qp.value)),
    answers: answersPlaceholder.map((answerPlaceholder, i) => {
      return replacePlaceholders(answerPlaceholder.value, [questionParams[i]?.value || '']);
    }),
  }
}

function MatchBuilder({matchIndex, removeMatch, placeholdersCount, control, register, errors}: MatchBuilderProps) {
  const { fields: questionParamsFields, append: appendAnswerPlaceholderField, remove: removeAnswerPlaceholderField } = useFieldArray({control, name: `matches.${matchIndex}.questionParams`});
  const questionParams = useWatch({ control, name: `matches.${matchIndex}.questionParams` });

  useEffect(() => {
    if (placeholdersCount > questionParams.length) {
      // add questionParams
      for(let i = questionParams.length; i < placeholdersCount; i++) {
        appendAnswerPlaceholderField({value: ''});
      }
    } else if (placeholdersCount < questionParams.length) {
      // remove questionParams
      for(let i = placeholdersCount; i < questionParams.length; i++) {
        removeAnswerPlaceholderField(i);
      }
    }
  }, [placeholdersCount, questionParams, appendAnswerPlaceholderField, removeAnswerPlaceholderField]);

  return <div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {questionParamsFields.map((questionParamField, i) => {
        return <div key={i} style={{margin: '0 5px'}}>
          <Input {...register(`matches.${matchIndex}.questionParams.${i}.value`, {required: 'This field is required.'})} placeholder={`$${i+1}`} />
          <AlertError><ErrorMessage errors={errors} name={`matches.${matchIndex}.questionParams.${i}.value`} /></AlertError>
        </div>
      })}
      <div><Button onClick={() => removeMatch(matchIndex)}>+ Remove match</Button></div>
    </div>
  </div>
}

function AnswersBuilder({control, register, errors}: AnswersBuilderProps) {
  const { fields: answersPlaceholderFields, append: appendAnswerPlaceholderField, remove: removeAnswerPlaceholderField } = useFieldArray({control, name: 'answersPlaceholder'});

  const deleteAnswer = (i: number) => {
    return () => removeAnswerPlaceholderField(i);
  }

  const addAnswer = () => appendAnswerPlaceholderField({value: ''});

  return <div>
    {answersPlaceholderFields.map((answerField, i) => {
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <Input {...register(`answersPlaceholder.${i}.value`, {required: 'This field is required.'})} style={{width: '150px'}} />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
        </AnswerField>
        <AlertError><ErrorMessage errors={errors} name={`answersPlaceholder.${i}.value`} /></AlertError>
      </AnswerFieldWrapper>
    })}
    <Button onClick={addAnswer}>Add answer</Button>
  </div>
}

function TournamentsCreate() {
  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({defaultValues: {
      questionPlaceholder: 'Who is going to win the match between $1 and $2?',
      answersPlaceholder: [{value: '$1'}, {value: '$2'}, {value: 'Draw'}],
      matches: [],
    }});

  const { fields: matchesFields, append: appendMatch, remove: removeMatch } = useFieldArray({control, name: 'matches'});

  const questionPlaceholder = useWatch({control, name: 'questionPlaceholder'});

  const onSubmit = (data: FormValues) => {
    const qAndA = data.matches.map(match => {
      return getMatchData(match.questionParams, data.questionPlaceholder, data.answersPlaceholder)
    })

    alert(qAndA.map(qa => `Q: ${qa.question}\nA: ${qa.answers.join(', ')}`).join("\n"))
  };

  useEffect(() => {
    const placeholders = questionPlaceholder.match(PLACEHOLDER_REGEX)
    setPlaceholdersCount(placeholders ? placeholders.length : 0);
  }, [questionPlaceholder])

  const addMatch = () => appendMatch({questionParams: []})

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <BoxRow>
          <BoxLabelCell>Question</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('questionPlaceholder', {required: 'This field is required.'})} style={{width: '100%'}}/>
            <AlertError><ErrorMessage errors={errors} name="questionPlaceholder" /></AlertError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Answers</BoxLabelCell>
          <AnswersBuilder {...{control, register, errors}} />
        </BoxRow>
      </Box>
      <Box>
        <BoxRow>
          <BoxTitleCell>Matches</BoxTitleCell>
          <div><Button onClick={addMatch}>+ Add match</Button></div>
        </BoxRow>
        {matchesFields.length > 0 &&
          <BoxRow style={{flexDirection: 'column'}}>
            {matchesFields.map((questionField, i) => {
              return (
                <div key={questionField.id} style={{padding: '10px', minWidth: '100%'}}>
                  <MatchBuilder
                    matchIndex={i}
                    {...{removeMatch, placeholdersCount, control, register, errors}}
                  />
                </div>
              )
            })}
          </BoxRow>
        }
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}><Button type="submit">Create Tournament</Button></div>
        </BoxRow>
      </Box>
    </form>
  );
}

export default TournamentsCreate;
