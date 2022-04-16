import React, {useEffect, useState} from "react";
import {Box, BoxRow, BoxLabelCell, BoxTitleCell, AlertError} from "../components"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import TemplateDialog from "../components/TemplateDialog";
import {tournamentsTemplates, TournamentTemplate} from "../lib/templates";
import AnswersBuilder from "../components/TournamentCreate/AnswersBuilder";
import PrizeWeightsBuilder from "../components/TournamentCreate/PrizeWeightsBuilder";
import MatchBuilder from "../components/TournamentCreate/MatchBuilder";
import TournamentForm, {TournamentFormValues, PLACEHOLDER_REGEX} from "../components/TournamentCreate/TournamentForm";

const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

function TournamentsCreate() {
  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const { register, handleSubmit, control, reset, getValues, setValue, formState: { errors } } = useForm<TournamentFormValues>({defaultValues: {
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
    <TournamentForm handleSubmit={handleSubmit}>
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
    </TournamentForm>
  );
}

export default TournamentsCreate;
