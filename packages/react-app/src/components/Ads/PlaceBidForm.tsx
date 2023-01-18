import React, {useEffect} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
import {ErrorMessage} from "@hookform/error-message";
import {useCall, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {FirstPriceAuction__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import {showWalletError} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from "@mui/material/FormHelperText";
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core";
import TextField from "@mui/material/TextField";
import {UseFormHandleSubmit, UseFormRegister, UseFormWatch} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {parseUnits} from "@ethersproject/units";
import {BigNumber} from "@ethersproject/bignumber";

export type PlaceBidFormValues = {
  market: string
  bid: string
  bidPerSecond: string
}

type PlaceBidFormProps = {
  itemId: string
  currentBid: string
  register: UseFormRegister<PlaceBidFormValues>
  errors: FieldErrors<PlaceBidFormValues>
  watch: UseFormWatch<PlaceBidFormValues>
  handleSubmit: UseFormHandleSubmit<PlaceBidFormValues>
  setShowActions: (showActions: boolean) => void
}

const firstPriceAuctionContract = new Contract(import.meta.env.VITE_FIRST_PRICE_AUCTION as string, FirstPriceAuction__factory.createInterface());

export default function PlaceBidForm({itemId, currentBid, register, errors, watch, handleSubmit, setShowActions}: PlaceBidFormProps) {
  const { account, error: walletError } = useEthers();

  const { state, send } = useContractFunction(firstPriceAuctionContract, 'placeBid');

  const { value: MIN_OFFER_DURATION } = useCall({ contract: firstPriceAuctionContract, method: 'MIN_OFFER_DURATION', args: [] }) || {value: [BigNumber.from(0)]}

  useEffect(() => {
    if (!account || showWalletError(walletError)) {
      setShowActions(false);
      return;
    }

    setShowActions(state.status !== 'Success');
  }, [state, account, walletError, setShowActions]);

  const bid = watch('bid');

  const validBid = (bidPerSecond: string) => {
    if (!bidPerSecond || MIN_OFFER_DURATION[0].eq(0)) {
      return false;
    }

    return ((Number(bid) + Number(currentBid)) / Number(bidPerSecond)) > MIN_OFFER_DURATION[0].toNumber();
  }

  const showError = showWalletError(walletError)
  if (showError) {
    return <Alert severity="error">{showError}</Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans id="Bid placed." /></Alert>
  }

  const onSubmit = async (data: PlaceBidFormValues) => {
    await send(
      itemId,
      data.market,
      parseUnits(data.bidPerSecond, 18),
      {
        value: parseUnits(data.bid, 18)
      }
    )
  }

  const isEdit = currentBid !== '0';

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="place-bid-form">
      {state.status === 'Mining' && <div style={{textAlign: 'center', margin: '15px 0'}}><CircularProgress /></div>}
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}

      <BoxWrapper>
        <BoxRow>
          <div style={{width: '40%'}}>
            <Trans id="Market" />
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('market', {
                required: i18n._("This field is required.")
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
            <Trans id="Bid" /> (xDAI)
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('bid', {
                required: i18n._("This field is required."),
                validate: {
                  isNumber: v => !isNaN(Number(v)) || i18n._("Invalid number."),
                  isGreaterThan0: v => (!isNaN(Number(v)) && (isEdit ? Number(v) >= 0 : Number(v) > 0)) || i18n._("Value must be greater than 0"),
                },
              })}
              style={{width: '100%'}}
              size="small"
              error={!!errors.bid}
            />
            {isEdit && <FormHelperText><Trans id="The provided value will be added to the current bid." /></FormHelperText>}
            <FormError><ErrorMessage errors={errors} name={`bid`} /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{width: '40%'}}>
            <Trans id="Bid per second" /> (xDAI)
          </div>
          <div style={{width: '60%'}}>
            <TextField {...register('bidPerSecond', {
                required: i18n._("This field is required."),
                validate: {
                  number: v => !isNaN(Number(v)) || i18n._("Invalid number."),
                  bid: v => validBid(v) || i18n._("Offer too low"),
                  isGreaterThan0: v => (!isNaN(Number(v)) && Number(v) > 0) || i18n._("Value must be greater than 0"),
                },
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