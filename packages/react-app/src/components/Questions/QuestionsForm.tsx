import React, {useEffect, useState} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
import {useQuestions} from "../../hooks/useQuestions";
import {FormControl, MenuItem, Select} from "@mui/material";
import {Control, useFieldArray} from "react-hook-form";
import {UseFormHandleSubmit, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Tournament, Tournament__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import type {BigNumberish} from "ethers";
import {useMatches} from "../../hooks/useMatches";
import {useTournament} from "../../hooks/useTournament";
import {queryClient} from "../../lib/react-query";

export type QuestionsFormValues = {
  outcomes: {value: number|''}[],
  provider: string
}

const DEVS = "0x9b59eeEA37618ed5227c3Fb2420F68fe5cD1151A";
const UBI_BURNER_ADDRESS = "0x43E9062F3D4B87C49b96ada5De230B1Ce69485c3";
const SPLITTER_DONATION_ADDRESS = "0x9378C3F269F5A3f87956FF8DBF2d83E361a7166c";
const providers = [
  { text: "support dev team", address: DEVS },
  { text: "support UBI", address: UBI_BURNER_ADDRESS },
  { text: "support UBI & dev team", address: SPLITTER_DONATION_ADDRESS },
  { text: "reward pool winners", address: AddressZero }
];

type QuestionsFormProps = {
  tournamentId: string
  price: BigNumberish
  control: Control<QuestionsFormValues>
  register: UseFormRegister<QuestionsFormValues>
  errors: FieldErrors<QuestionsFormValues>
  handleSubmit: UseFormHandleSubmit<QuestionsFormValues>
}

export default function QuestionsForm({tournamentId, price, control, register, errors, handleSubmit}: QuestionsFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: matches } = useMatches(tournamentId);
  const { isLoading: isLoadingTournament, data: tournament } = useTournament(tournamentId);
  const { data: questions } = useQuestions(tournamentId);
  const [success, setSuccess] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    matches && matches.forEach(() => append({value: ''}))
  }, [matches, append, remove]);

  const { state, send } = useContractFunction(
    new Contract(tournamentId, Tournament__factory.createInterface()) as Tournament,
    'placeBet'
  );

  useEffect(() => {
    if (state.status === 'Success') {
      queryClient.invalidateQueries(['useTournament', tournamentId]);
      queryClient.invalidateQueries(['useRanking', tournamentId]);
      setSuccess(true);
    }
  }, [state, tournamentId]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  if (isLoading || isLoadingTournament) {
    return <div>Loading...</div>
  }

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to place a bet.'}</Alert>
  }

  if (error) {
    return <Alert severity="error">Error loading questions.</Alert>
  }

  if (success) {
    return <Alert severity="success">Bet placed!</Alert>
  }

  const onSubmit = async (data: QuestionsFormValues) => {
    const results = data.outcomes.map(outcome => {
      if (outcome.value === '') {
        throw Error('Invalid outcome')
      }

      return hexZeroPad(hexlify(outcome.value), 32)
    });

    await send(
      data.provider,
      results,
      {
        value: price
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="questions-form">
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <div style={{width: '80%'}}>Question</div>
          <div style={{width: '20%'}}>Outcome</div>
        </BoxRow>
        {fields.map((field, i) => {
          if (!matches || !matches[i] || !questions?.[matches[i].questionID]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{questions[matches[i].questionID].qTitle}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: 'This field is required.'})}
                >
                  {questions[matches[i].questionID].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome.answer}</MenuItem>)}
                  <MenuItem value="0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff">Invalid result</MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
        })}
        <BoxRow>
          <div style={{width: '60%'}}>Use {Number(tournament?.managementFee) / 100}% of this pool to: </div>
          <div style={{width: '40%'}}>
            <FormControl fullWidth>
              <Select
                defaultValue={DEVS}
                id={`provider-select`}
                {...register(`provider`, {required: 'This field is required.'})}
              >
                {providers.map((prov, i) => <MenuItem value={prov.address} key={i}>{prov.text}</MenuItem>)}
              </Select>
              <FormError><ErrorMessage errors={errors} name={`provider`} /></FormError>
            </FormControl>
          </div>
        </BoxRow>
      </BoxWrapper>
    </form>
  );
}
