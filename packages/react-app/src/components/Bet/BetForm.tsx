import React, {useEffect} from "react";
import {BigAlert, FormError} from "../../components"
import {FormControl} from "@mui/material";
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {useEthers} from "@usedapp/core";
import Alert from "@mui/material/Alert";
import { AddressZero } from "@ethersproject/constants";
import { isAddress } from "@ethersproject/address";
import {useEvents} from "../../hooks/useEvents";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {getReferralKey, showWalletError} from "../../lib/helpers";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import {BigNumber} from "@ethersproject/bignumber";
import {useBetToken} from "../../hooks/useBetToken";
import CircularProgress from "@mui/material/CircularProgress";
import {FormatEvent} from "../FormatEvent";
import {ReactComponent as TriangleIcon} from "../../assets/icons/triangle-right.svg";
import {ReactComponent as CrossIcon} from "../../assets/icons/cross.svg";
import {formatOutcome} from "../../lib/reality";
import {FormEventOutcomeValue} from "../Answer/AnswerForm";
import {usePlaceBet} from "../../hooks/usePlaceBet";
import {Market} from "../../graphql/subgraph";
import Box from "@mui/material/Box";
import AlertTitle from "@mui/material/AlertTitle";
import {BetOutcomeSelect} from "./BetOutcomeSelect";
import {useCurateItemJson} from "../../hooks/useCurateItems";
import {useMatchesInterdependencies} from "../../hooks/useMatchesInterdependencies";

export type BetFormOutcomeValue = FormEventOutcomeValue | FormEventOutcomeValue[] | '';

export type BetFormValues = {
  outcomes: {value: BetFormOutcomeValue, questionId: string}[]
}

type BetFormProps = {
  market: Market
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
    </div>
    <img src={image} style={{margin: '20px 0'}} alt="Bet NFT" />
    <div>
      <p><Trans>You can transfer or sell it in a marketplace, but remember that the owner of this NFT may claim a prize if this bet wins.</Trans></p>
    </div>
    <div>
      <Button component={Link} size="large" href={`https://epor.io/tokens/${marketId}/${tokenId}?network=xDai`} target="_blank" rel="noopener"><Trans>Trade NFT in Eporio</Trans></Button>
    </div>
  </div>
}

export default function BetForm({market, cancelHandler}: BetFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: events } = useEvents(market.id);

  const { register, control, formState: {errors}, handleSubmit, setValue } = useForm<BetFormValues>({
    mode: 'all',
    defaultValues: {
      outcomes: [],
    }});

  const outcomes = useWatch({control, name: 'outcomes'});

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    events && events.forEach(() => append({value: ''}))
  }, [events, append, remove]);

  const { state, placeBet, tokenId, hasVoucher } = usePlaceBet(market.id, market.price);

  useEffect(() => {
    if (tokenId !== false) {
      queryClient.invalidateQueries(['useMarket', market.id]);
      queryClient.invalidateQueries(['useRanking', market.id]);
    }
  }, [tokenId, market.id]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  const itemJson = useCurateItemJson(market.hash);
  const matchesInterdependencies = useMatchesInterdependencies(events, itemJson);

  if (isLoading ) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (tokenId !== false) {
    return <>
      <Alert severity="success" sx={{mb: 3}}><Trans>Bet placed!</Trans></Alert>

      <BetNFT marketId={market.id} tokenId={tokenId} />
    </>
  }

  if (!account || walletError) {
    return <Alert severity="error">{showWalletError(walletError) || <Trans>Connect your wallet to place a bet.</Trans>}</Alert>
  }

  if (error) {
    return <Alert severity="error"><Trans>Error loading events</Trans>.</Alert>
  }

  const onSubmit = async (data: BetFormValues) => {
    const results = data.outcomes
      /**
       * ============================================================
       * THE RESULTS MUST BE SORTED BY QUESTION ID IN 'ascending' ORDER
       * OTHERWISE THE BETS WILL BE PLACED INCORRECTLY
       * ============================================================
       */
      .sort((a, b) => a.questionId > b.questionId ? 1 : -1)
      .map(outcome => formatOutcome(outcome.value));
    const referral = window.localStorage.getItem(getReferralKey(market.id)) || '';

    await placeBet(
      isAddress(referral) ? referral : AddressZero,
      results
    )
  }

  if (state.status === 'Mining') {
    return <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 style={{margin: '35px 0', fontSize: '33.18px'}}><Trans>Place your bet</Trans></h2>
      <h4 style={{margin: '35px 0', borderBottom: '1px solid #303030', paddingBottom: '20px'}}><Trans>Answer all questions. You will get 1 point for each correct prediction. The top ranked bets win the market’s prize!</Trans></h4>

      {hasVoucher && <BigAlert severity="info" sx={{mb: 4}}>
        <Box sx={{display: {md: 'flex'}, justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div><AlertTitle><Trans>Congratulations!</Trans></AlertTitle></div>
            <div><Trans>You have a voucher available to place a bet for free!</Trans></div>
          </div>
        </Box>
      </BigAlert>}

      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <Grid container spacing={3}>
        {fields.map((field, i) => {

          if (!events || !events[i]) {
            return null;
          }
          return <React.Fragment key={events[i].id}>
            <Grid item xs={12} md={6}><FormatEvent title={events[i].title} /></Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <BetOutcomeSelect key={events[i].id} matchesInterdependencies={matchesInterdependencies} events={events} i={i} outcomes={outcomes} control={control} errors={errors} setValue={setValue} />
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
              <input type="hidden" {...register(`outcomes.${i}.questionId`, {required: t`This field is required`})} value={events[i].id} />
            </Grid>
          </React.Fragment>
        })}
        <Grid item xs={6}>
          <Button type="button" color="primary" size="large" variant="outlined" fullWidth onClick={cancelHandler}>
            <Trans>Cancel</Trans> <CrossIcon style={{marginLeft: 10}} width={10} height={10} />
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
