import React, {useEffect} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
import {ErrorMessage} from "@hookform/error-message";
import {useCall, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {FirstPriceAuction__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import {showWalletError} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans, t } from "@lingui/macro";
import TextField from "@mui/material/TextField";
import {UseFormHandleSubmit, UseFormRegister, UseFormWatch} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

export type PlaceBidFormValues = {
  market: string
  bid: number
  bidPerSecond: number
}

type PlaceBidFormProps = {
  itemId: string
  register: UseFormRegister<PlaceBidFormValues>
  errors: FieldErrors<PlaceBidFormValues>
  watch: UseFormWatch<PlaceBidFormValues>
  handleSubmit: UseFormHandleSubmit<PlaceBidFormValues>
  setShowActions: (showActions: boolean) => void
}

const firstPriceAuctionContract = new Contract(process.env.REACT_APP_FIRST_PRICE_AUCTION as string, FirstPriceAuction__factory.createInterface());

export default function PlaceBidForm({itemId, register, errors, watch, handleSubmit, setShowActions}: PlaceBidFormProps) {
  const { account, error: walletError } = useEthers();

  const { state, send } = useContractFunction(firstPriceAuctionContract, 'placeBid');

  const { value: MIN_OFFER_DURATION } = useCall({ contract: firstPriceAuctionContract, method: 'MIN_OFFER_DURATION', args: [] }) || {value: [BigNumber.from(0)]}

  useEffect(() => {
    if (!account || walletError) {
      setShowActions(false);
      return;
    }

    setShowActions(state.status !== 'Success');
  }, [state, account, walletError, setShowActions]);

  const bid = watch('bid');

  const validBid = (bidPerSecond: number) => {
    if (!bidPerSecond || MIN_OFFER_DURATION[0].eq(0)) {
      return false;
    }

    return (bid / bidPerSecond) > MIN_OFFER_DURATION[0].toNumber();
  }

  if (walletError) {
    return <Alert severity="error">{showWalletError(walletError)}</Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Bid placed.</Trans></Alert>
  }

  const onSubmit = async (data: PlaceBidFormValues) => {
    await send(
      itemId,
      data.market,
      parseUnits(String(data.bidPerSecond), 18),
      {
        value: parseUnits(String(data.bid), 18)
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="place-bid-form">
      {state.status === 'Mining' && <div style={{textAlign: 'center', margin: '15px 0'}}><CircularProgress /></div>}
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}

      <BoxWrapper>
        <BoxRow>
          <div style={{width: '40%'}}>
            <Trans>Market</Trans>
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('market', {
                required: t`This field is required.`
              })}
              style={{width: '100%'}}
              size="small"
              error={!!errors.market}
            />
            <FormError><ErrorMessage errors={errors} name={`market`} /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{width: '40%'}}>
            <Trans>Bid</Trans>
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('bid', {
                required: t`This field is required.`,
                valueAsNumber: true,
                validate: v => !isNaN(Number(v)) || t`Invalid number.`,
                min: { value: 0.000000000000000001, message: t`Price must be greater than 0` }
              })}
              style={{width: '100%'}}
              size="small"
              error={!!errors.bid}
            />
            <FormError><ErrorMessage errors={errors} name={`bid`} /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{width: '40%'}}>
            <Trans>Bid per second</Trans>
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('bidPerSecond', {
                required: t`This field is required.`,
                valueAsNumber: true,
                validate: {
                  number: v => !isNaN(Number(v)) || t`Invalid number.`,
                  bid: v => validBid(v) || t`Offer too low`,
                },
                min: { value: 0.000000000000000001, message: t`Price must be greater than 0` }
              })}
              style={{width: '100%'}}
              size="small"
              error={!!errors.bidPerSecond}
            />
            <FormError><ErrorMessage errors={errors} name={`bidPerSecond`} /></FormError>
          </div>
        </BoxRow>
      </BoxWrapper>
    </form>
  );
}