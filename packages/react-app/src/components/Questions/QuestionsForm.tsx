import React, {useEffect, useState} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
import {FormControl, MenuItem, Select} from "@mui/material";
import {Control, useFieldArray} from "react-hook-form";
import {UseFormHandleSubmit, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Market__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import type {BigNumberish} from "ethers";
import {useEvents} from "../../hooks/useEvents";
import {useMarket} from "../../hooks/useMarket";
import {queryClient} from "../../lib/react-query";
import {futurizeQuestion} from "../../lib/templates";

export type QuestionsFormValues = {
  outcomes: {value: number|''}[],
  provider: string
}

export const INVALID_RESULT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

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
  marketId: string
  price: BigNumberish
  control: Control<QuestionsFormValues>
  register: UseFormRegister<QuestionsFormValues>
  errors: FieldErrors<QuestionsFormValues>
  handleSubmit: UseFormHandleSubmit<QuestionsFormValues>
}

export default function QuestionsForm({marketId, price, control, register, errors, handleSubmit}: QuestionsFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: events } = useEvents(marketId);
  const { isLoading: isLoadingMarket, data: market } = useMarket(marketId);
  const [success, setSuccess] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    events && events.forEach(() => append({value: ''}))
  }, [events, append, remove]);

  const { state, send } = useContractFunction(
    new Contract(marketId, Market__factory.createInterface()),
    'placeBet'
  );

  useEffect(() => {
    if (state.status === 'Success') {
      queryClient.invalidateQueries(['useMarket', marketId]);
      queryClient.invalidateQueries(['useRanking', marketId]);
      setSuccess(true);
    }
  }, [state, marketId]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  if (isLoading || isLoadingMarket) {
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
          if (!events || !events[i]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{futurizeQuestion(events[i].title)}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: 'This field is required.'})}
                >
                  {events[i].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}>Invalid result</MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
        })}
        <BoxRow>
          <div style={{width: '60%'}}>Use {Number(market?.managementFee) / 100}% of this pool to: </div>
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
