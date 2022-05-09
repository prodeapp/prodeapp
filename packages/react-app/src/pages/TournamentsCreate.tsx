import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, BoxTitleCell, FormError} from "../components"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {Controller, useFieldArray, useForm, useWatch} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import TemplateDialog from "../components/TemplateDialog";
import {tournamentsTemplates, TournamentTemplate} from "../lib/templates";
import AnswersBuilder from "../components/TournamentCreate/AnswersBuilder";
import PrizeWeightsBuilder from "../components/TournamentCreate/PrizeWeightsBuilder";
import MatchBuilder from "../components/TournamentCreate/MatchBuilder";
import TournamentForm, {TournamentFormValues, PLACEHOLDER_REGEX} from "../components/TournamentCreate/TournamentForm";
import dateAdd from 'date-fns/add'
import { isAddress } from "@ethersproject/address";

const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

function TournamentsCreate() {

  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const today = new Date();
  const defaultClosingTime = dateAdd(today, {days: 5});

  const { register, handleSubmit, control, reset, getValues, setValue, formState: { errors } } = useForm<TournamentFormValues>({defaultValues: {
      tournament: '',
      questionPlaceholder: tournamentsTemplates[0].q,
      answersPlaceholder: formatAnswers(tournamentsTemplates[0].a),
      matches: [],
      prizeWeights: [{value: 50}, {value: 30}, {value: 20}],
      prizeDivisor: 0,
      closingTime: defaultClosingTime,
      manager: '',
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
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Tournament name</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('tournament', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="tournament" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Question</BoxLabelCell>
          <div style={{width: '100%'}}>
            <div style={{display: 'flex'}}>
              <Input {...register('questionPlaceholder', {
                required: 'This field is required.'
              })} style={{flexGrow: 1}}/>
              <Button style={{flexGrow: 0, marginLeft: '10px'}} onClick={() => setOpenModal(true)}>Change template</Button>
            </div>
            <FormError><ErrorMessage errors={errors} name="questionPlaceholder" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Answers</BoxLabelCell>
          <AnswersBuilder {...{control, register, errors}} />
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Betting deadline</BoxLabelCell>
          <div style={{textAlign: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name='closingTime'
                rules={{required: 'This field is required'}}
                render={({ field }) => (
                  <DateTimePicker
                    label='Select date'
                    minDate={today}
                    onChange={field.onChange}
                    value={field.value}
                    renderInput={(params) => <TextField {...params} />}
                  />
                )}
              />
            </LocalizationProvider>
            <FormHelperText>Bets will not be accepted passed this time. It should be before the beginning of the first match.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="closingTime" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Bet price (xDAI)</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('price', {
              required: 'This field is required.',
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: { value: 0.01, message: 'Price must be greater than 0.01' }
            })} style={{width: '100%'}} />
            <FormError><ErrorMessage errors={errors} name="price" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Manager</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('manager', {
              required: 'This field is required.',
              validate: v => isAddress(v) || 'Invalid address.',
            })} style={{width: '100%'}} />
            <FormHelperText>Address to send management fees to.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="manager" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Management Fee (%)</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('managementFee', {
              required: 'This field is required.',
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: {value: 0, message: 'Fee must be greater than 0.'},
              max: {value: 100, message: 'Fee must be lower than 100.'}
            })} style={{width: '100%'}} />
            <FormHelperText>The manager will receive this percentage of the pool as reward. In addition, the tournament creator will be rewarded when bets are traded on NFT marketplaces. UI providers may apply this fee as well for each bet.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="managementFee" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Prize Distribution (%)</BoxLabelCell>
          <PrizeWeightsBuilder {...{control, register, errors, setValue}} />
        </BoxRow>
      </BoxWrapper>
      <BoxWrapper>
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
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button type="submit">Create Tournament</Button>
          </div>
        </BoxRow>}
      </BoxWrapper>
    </TournamentForm>
  );
}

export default TournamentsCreate;
