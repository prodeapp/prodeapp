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
import { isAddress } from "@ethersproject/address";
import type {BigNumberish} from "ethers";
import {useEvents} from "../../hooks/useEvents";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {getReferralKey} from "../../lib/helpers";

export type QuestionsFormValues = {
  outcomes: {value: number|''}[]
}

export const INVALID_RESULT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

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
  const [success, setSuccess] = useState(false);
  const [referral, setReferral] = useState(AddressZero);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    events && events.forEach(() => append({value: ''}))
  }, [events, append, remove]);

  useEffect(() => {
    setReferral(window.localStorage.getItem(getReferralKey(marketId)) || '');
  }, [marketId]);

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

  if (isLoading ) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || <Trans>Connect your wallet to place a bet.</Trans>}</Alert>
  }

  if (error) {
    return <Alert severity="error"><Trans>Error loading questions</Trans>.</Alert>
  }

  if (success) {
    return <Alert severity="success"><Trans>Bet placed</Trans>!</Alert>
  }

  const onSubmit = async (data: QuestionsFormValues) => {
    const results = data.outcomes.map(outcome => {
      if (outcome.value === '') {
        throw Error(t`Invalid outcome`)
      }

      return hexZeroPad(hexlify(outcome.value), 32)
    });

    await send(
      isAddress(referral) ? referral : AddressZero,
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
          <div style={{width: '80%'}}><Trans>Question</Trans></div>
          <div style={{width: '20%'}}><Trans>Outcome</Trans></div>
        </BoxRow>
        {fields.map((field, i) => {
          if (!events || !events[i]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{events[i].title}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: t`This field is required`})}
                >
                  {events[i].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
        })}
      </BoxWrapper>
    </form>
  );
}
