import React from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import Alert from "@mui/material/Alert";
import {useParams} from "react-router-dom";
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core"
import {parseUnits} from "@ethersproject/units";
import {Address, getAccount} from "@wagmi/core";
import {useNetwork} from "wagmi";
import {useContractWrite} from "wagmi";
import {MarketAbi} from "../abi/Market";

export type FundMarketFormData = {
  value: string
  message: string
}

function MarketsFund() {
  const { id: marketId } = useParams();
  const {address} = getAccount();
  const { chain } = useNetwork()

  const {register, handleSubmit, formState: { errors, isValid }} = useForm<FundMarketFormData>({
    mode: 'all',
    defaultValues: {
      value: '0',
      message: ''
    }
  });

  const { isSuccess, error, write } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: String(marketId) as Address,
    abi: MarketAbi,
    functionName: 'fundMarket',
  })

  const onSubmit = async (data: FundMarketFormData) => {
    await write!({
      recklesslySetUnpreparedArgs: [data.message],
      recklesslySetUnpreparedOverrides: {
        value: parseUnits(String(data.value), 18),
      }
    });
  }

  if (!address) {
    return <Alert severity="error"><Trans id="Connect your wallet to fund a market." /></Alert>
  }

  if (!chain || chain.unsupported) {
    return <Alert severity="error"><Trans id="UNSUPPORTED_CHAIN" /></Alert>
  }

  return <>
    {error && <Alert severity="error" sx={{mb: 2}}>{error.message}</Alert>}
    {isSuccess && <Alert severity="success" sx={{mb: 2}}><Trans id="Market funded successfully!" /></Alert>}

    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans id="Fund amount (xDAI)" /></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('value', {
              required: i18n._("This field is required."),
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || i18n._("Invalid number."),
              min: { value: 0.01, message: i18n._("Fund amount must be greater than 0.01") }
            })} style={{width: '100%'}} />
            <FormError><ErrorMessage errors={errors} name="value" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans id="Message" /></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('message', {
              required: false,
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="message" /></FormError>
          </div>
        </BoxRow>
      </BoxWrapper>

      {isValid && <div style={{textAlign: 'center', width: '100%', marginBottom: '20px'}}>
        <div><Button type="submit"><Trans id="Submit" /></Button></div>
      </div>}
    </form>
  </>
}

export default MarketsFund;
