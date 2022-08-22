import React, {useEffect, useState} from "react";
import {FormError} from "../../components"
import {FormControl, MenuItem, Select} from "@mui/material";
import {useFieldArray, useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Market__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { AddressZero } from "@ethersproject/constants";
import { isAddress } from "@ethersproject/address";
import type {BigNumberish} from "ethers";
import {useEventsToBet} from "../../hooks/useEvents";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {getReferralKey, showWalletError, transOutcome} from "../../lib/helpers";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import {BigNumber} from "@ethersproject/bignumber";
import {useBetToken} from "../../hooks/useBetToken";
import CircularProgress from "@mui/material/CircularProgress";
import {INVALID_RESULT} from "../Answer/AnswerForm";
import {FormatEvent} from "../FormatEvent";
import {ReactComponent as TriangleIcon} from "../../assets/icons/triangle-right.svg";
import {ReactComponent as CrossIcon} from "../../assets/icons/cross.svg";
import {REALITY_TEMPLATE_MULTIPLE_SELECT} from "../../lib/reality";

export type BetFormValues = {
  outcomes: {value: number|""|[number]}[]
}

type BetFormProps = {
  marketId: string
  price: BigNumberish
  cancelHandler: () => void
}

function BetNFT({marketId, tokenId}: {marketId: string, tokenId: BigNumber}) {
  const image = useBetToken(marketId, tokenId);

  if (!image) {
    return null
  }

  return <div style={{textAlign: 'center', margin: '10px 0'}}>
    <div>
      <p><Trans>Your betting position is represented by the following NFT.</Trans></p>
      <p><Trans>You can transfer or sell it in a marketplace, but remember that the owner of this NFT may claim a prize if this bet wins.</Trans></p>
    </div>
    <img src={image} style={{margin: '20px 0'}} alt="Bet NFT" />
    <div>
      <Button component={Link} size="large" href={`https://epor.io/tokens/${marketId}/${tokenId}?network=xDai`} target="_blank" rel="noopener"><Trans>Trade NFT in Eporio</Trans></Button>
    </div>
  </div>
}

export default function BetForm({marketId, price, cancelHandler}: BetFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: events } = useEventsToBet(marketId);
  const [success, setSuccess] = useState(false);
  const [tokenId, setTokenId] = useState<BigNumber|false>(false);
  const [referral, setReferral] = useState(AddressZero);

  const { register, control, formState: {errors}, handleSubmit } = useForm<BetFormValues>({defaultValues: {
      outcomes: [],
    }});


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

  const { state, send, events: placeBetEvents } = useContractFunction(
    new Contract(marketId, Market__factory.createInterface()),
    'placeBet'
  );

  useEffect(()=> {
    if (placeBetEvents) {
      setTokenId(placeBetEvents.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false);
    }
  }, [placeBetEvents]);

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

  if (success) {
    return <>
      <Alert severity="success" sx={{mb: 3}}><Trans>Bet placed!</Trans></Alert>

      {tokenId !== false && <BetNFT marketId={marketId} tokenId={tokenId} />}
    </>
  }

  if (!account || walletError) {
    return <Alert severity="error">{showWalletError(walletError) || <Trans>Connect your wallet to place a bet.</Trans>}</Alert>
  }

  if (error) {
    return <Alert severity="error"><Trans>Error loading events</Trans>.</Alert>
  }

  const onSubmit = async (data: BetFormValues) => {
    const results = data.outcomes.map(outcome => {
      if (typeof outcome.value === 'object') {
        // multiple-select
        let outcomeValue = Object(outcome.value);
        if (outcomeValue.length === 0) {
           throw Error(t`Invalid outcome`)
        }
        if (outcomeValue.every((x: any) => typeof x === 'number')) {
          const answerChoice = outcomeValue.reduce((partialSum: number, value:number) => partialSum + 2**value, 0);
          return hexZeroPad(hexlify(answerChoice), 32);
        } else {
          // TODO: Update select to show only invalid result. This option it's incompatible with multiselect
          if (outcomeValue.includes(INVALID_RESULT)) return INVALID_RESULT
        }
      } else {
        // single-select
        if (outcome.value === '') {
          throw Error(t`Invalid outcome`)
        }
        return hexZeroPad(hexlify(outcome.value), 32)
      }
      throw Error(t`Invalid outcome`)
    });

    await send(
      isAddress(referral) ? referral : AddressZero,
      results,
      {
        value: price
      }
    )
  }

  if (state.status === 'Mining') {
    return <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 style={{margin: '35px 0', fontSize: '33.18px', borderBottom: '1px solid #303030', paddingBottom: '20px'}}><Trans>Place your bet</Trans></h2>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <Grid container spacing={3}>
        {fields.map((field, i) => {

          if (!events || !events[i]) {
            return null;
          }
          return <React.Fragment key={events[i].id}>
            <Grid item xs={6}><FormatEvent title={events[i].title} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <Select
                  defaultValue={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ""}
                  id={`event-${i}-outcome-select`}
                  multiple={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
                  {...register(`outcomes.${i}.value`, {required: t`This field is required`})}
                >
                  {events[i].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{transOutcome(outcome)}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </Grid>
          </React.Fragment>
        })}
        <Grid item xs={6}>
          <Button type="button" color="primary" size="large" variant="outlined" fullWidth onClick={cancelHandler}>
            <Trans>Cancel</Trans> <CrossIcon style={{marginLeft: 10}} />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button type="submit" color="primary" size="large" fullWidth>
            <Trans>Place Bet</Trans> <TriangleIcon style={{marginLeft: 10, fill: 'currentColor', color: 'white'}} />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
