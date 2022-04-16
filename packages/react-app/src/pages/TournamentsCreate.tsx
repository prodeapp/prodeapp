import React, {useEffect, useState} from "react";
import {Box, BoxRow, BoxLabelCell, BoxTitleCell, AlertError, AnswerFieldWrapper, AnswerField} from "../components"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import {Control, useFieldArray, useForm, useWatch} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {UseFormRegister, UseFormSetValue} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import TemplateDialog from "../components/TemplateDialog";
import {tournamentsTemplates, TournamentTemplate} from "../lib/templates";

const PLACEHOLDER_REGEX = /\$\d/g

type AnswersPlaceholder = {value: string}[];
type QuestionParams = {value: string}[];
type PrizeWeight = {value: number};

type MatchBuilderProps = {
  matchIndex: number
  removeMatch: (i: number) => void
  placeholdersCount: number
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
}

type FormValues = {
  tournament: string
  questionPlaceholder: string
  matches: {questionParams: QuestionParams}[]
  answersPlaceholder: AnswersPlaceholder
  prizeWeights: PrizeWeight[]
  prizeDivisor: number
}

type AnswersBuilderProps = {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
}

type PrizeWeightsBuilderProps = {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  setValue: UseFormSetValue<FormValues>
}

type MatchData = {
  question: string
  answers: string[]
}

function replacePlaceholders(text: string, questionParams: string[]) {
  return text.replace(
    PLACEHOLDER_REGEX,
    (match) => {
      return questionParams[Number(match.replace('$','')) -1] || match;
    }
  )
}

function getMatchData(questionParams: QuestionParams, questionPlaceholder: string, answersPlaceholder: AnswersPlaceholder): MatchData {
  return {
    question: replacePlaceholders(questionPlaceholder, questionParams.map(qp => qp.value)),
    answers: answersPlaceholder.map((answerPlaceholder, i) => {
      return replacePlaceholders(answerPlaceholder.value, questionParams.map(qp => qp.value));
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
      <div><Button onClick={() => removeMatch(matchIndex)}>- Remove match</Button></div>
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
    {answersPlaceholderFields.length < 2 && <AlertError style={{marginBottom: '5px'}}>Add at least two answers.</AlertError>}
    {answersPlaceholderFields.map((answerField, i) => {
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <Input {...register(`answersPlaceholder.${i}.value`, {required: 'This field is required.'})} style={{width: '150px'}} />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
        </AnswerField>
        <AlertError><ErrorMessage errors={errors} name={`answersPlaceholder.${i}.value`} /></AlertError>
      </AnswerFieldWrapper>
    })}
    <Button onClick={addAnswer} size="small">Add answer</Button>
  </div>
}

function PrizeWeightsBuilder({control, register, errors, setValue}: PrizeWeightsBuilderProps) {
  const { fields: prizesFields, append: appendPrizesField, remove: removePrizesField } = useFieldArray({control, name: 'prizeWeights'});

  const prizeWeights = useWatch({control, name: 'prizeWeights'});

  useEffect(() => {
    setValue('prizeDivisor', prizeWeights.map((pw) => Number(pw.value)).reduce((partialSum, a) => partialSum + a, 0));
  }, [setValue, prizeWeights]);

  const deletePrizeWeight = (i: number) => {
    return () => removePrizesField(i);
  }

  const addPrizeWeight = () => appendPrizesField({value: 0});

  return <div>
    {prizesFields.length === 0 && <AlertError style={{marginBottom: '5px'}}>Add at least one prize weight.</AlertError>}
    {prizesFields.map((answerField, i) => {
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <div style={{marginRight: '10px'}}>#{i+1}</div>
          <Input {...register(`prizeWeights.${i}.value`, {required: 'This field is required.'})} style={{width: '100px'}} type="number" />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deletePrizeWeight(i)}>[x]</div>
        </AnswerField>
        <AlertError><ErrorMessage errors={errors} name={`prizeWeights.${i}.value`} /></AlertError>
      </AnswerFieldWrapper>
    })}
    <AlertError><ErrorMessage errors={errors} name={`prizeDivisor`} /></AlertError>
    <Button onClick={addPrizeWeight} size="small">Add prize weight</Button>
  </div>
}


const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

function TournamentsCreate() {
  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const { register, handleSubmit, control, reset, getValues, setValue, formState: { errors } } = useForm<FormValues>({defaultValues: {
      tournament: '',
      questionPlaceholder: tournamentsTemplates[0].q,
      answersPlaceholder: formatAnswers(tournamentsTemplates[0].a),
      matches: [],
      prizeWeights: [{value: 40}, {value: 30}, {value: 20}, {value: 10}],
      prizeDivisor: 0,
    }});

  const { fields: matchesFields, append: appendMatch, remove: removeMatch } = useFieldArray({control, name: 'matches'});

  const questionPlaceholder = useWatch({control, name: 'questionPlaceholder'});
  const answersPlaceholder = useWatch({control, name: 'answersPlaceholder'});

  const onSubmit = (data: FormValues) => {
    const qAndA = data.matches.map(match => {
      return getMatchData(match.questionParams, data.questionPlaceholder, data.answersPlaceholder)
    })

    alert(`
Tournament: ${data.tournament}

${qAndA.map(qa => `Q: ${qa.question}\nA: ${qa.answers.join(', ')}`).join("\n")}
    `)
  };

  useEffect(() => {
    register('prizeDivisor', {
      validate: value => value === 100 || 'The sum of prize weights must be 100.'
    });
  }, [register]);

  useEffect(() => {
    const placeholders = questionPlaceholder.match(PLACEHOLDER_REGEX)
    setPlaceholdersCount(placeholders ? placeholders.length : 0);
  }, [questionPlaceholder])

  const addMatch = () => appendMatch({questionParams: []})

  const handleClose = () => {
    setOpenModal(false);
  };

  const onTemplateChange = (template?: TournamentTemplate) => {
    if (template) {
      reset({
        tournament: getValues('tournament'),
        questionPlaceholder: template.q,
        answersPlaceholder: formatAnswers(template.a)
      });
    }
    setOpenModal(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TemplateDialog
        open={openModal}
        handleClose={handleClose}
        tournamentsTemplates={tournamentsTemplates}
        onTemplateChange={onTemplateChange}
      />
      <Box>
        <BoxRow>
          <BoxLabelCell>Tournament name</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('tournament', {required: 'This field is required.'})} style={{width: '100%'}}/>
            <AlertError><ErrorMessage errors={errors} name="tournament" /></AlertError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Question</BoxLabelCell>
          <div style={{width: '100%'}}>
            <div style={{display: 'flex'}}>
              <Input {...register('questionPlaceholder', {required: 'This field is required.'})} style={{flexGrow: 1}}/>
              <Button style={{flexGrow: 0, marginLeft: '10px'}} onClick={() => setOpenModal(true)}>Change template</Button>
            </div>
            <AlertError><ErrorMessage errors={errors} name="questionPlaceholder" /></AlertError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Answers</BoxLabelCell>
          <AnswersBuilder {...{control, register, errors}} />
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Prize Weights</BoxLabelCell>
          <PrizeWeightsBuilder {...{control, register, errors, setValue}} />
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
        {matchesFields.length > 0 && answersPlaceholder.length > 1 && <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}><Button type="submit">Create Tournament</Button></div>
        </BoxRow>}
      </Box>
    </form>
  );
}

export default TournamentsCreate;
