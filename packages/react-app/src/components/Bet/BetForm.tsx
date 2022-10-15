import React, {useEffect, useState} from "react";
import {BigAlert, FormError} from "../../components"
import {FormControl, MenuItem, Select} from "@mui/material";
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {useEthers} from "@usedapp/core";
import Alert from "@mui/material/Alert";
import { AddressZero } from "@ethersproject/constants";
import { isAddress } from "@ethersproject/address";
import {useEvents} from "../../hooks/useEvents";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {getReferralKey, showWalletError, transOutcome} from "../../lib/helpers";
import {useFormatMatches} from "../../lib/simplifyPredictions";
import {
  DecodedCurateListFields,
  fetchCurateItemsByHash,
  getDecodedParams} from "../../lib/curate";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import {BigNumber} from "@ethersproject/bignumber";
import {useBetToken} from "../../hooks/useBetToken";
import CircularProgress from "@mui/material/CircularProgress";
import {FormatEvent} from "../FormatEvent";
import {ReactComponent as TriangleIcon} from "../../assets/icons/triangle-right.svg";
import {ReactComponent as CrossIcon} from "../../assets/icons/cross.svg";
import {formatOutcome, INVALID_RESULT, REALITY_TEMPLATE_MULTIPLE_SELECT} from "../../lib/reality";
import {FormEventOutcomeValue} from "../Answer/AnswerForm";
import {usePlaceBet} from "../../hooks/usePlaceBet";
import {Market} from "../../graphql/subgraph";
import Box from "@mui/material/Box";
import AlertTitle from "@mui/material/AlertTitle";

export type BetFormValues = {
  outcomes: {value: FormEventOutcomeValue | FormEventOutcomeValue[] | '', questionId: string}[]
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
      <p><Trans>You can transfer or sell it in a marketplace, but remember that the owner of this NFT may claim a prize if this bet wins.</Trans></p>
    </div>
    <img src={image} style={{margin: '20px 0'}} alt="Bet NFT" />
    <div>
      <Button component={Link} size="large" href={`https://epor.io/tokens/${marketId}/${tokenId}?network=xDai`} target="_blank" rel="noopener"><Trans>Trade NFT in Eporio</Trans></Button>
    </div>
  </div>
}

export default function BetForm({market, cancelHandler}: BetFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: events } = useEvents(market.id);
  const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null);

  const { register, control, formState: {errors}, handleSubmit } = useForm<BetFormValues>({defaultValues: {
      outcomes: [],
    }});

  const outcomes = useWatch({ control, name: `outcomes` });

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

  useEffect(() => {
    (async () => {
      const curateItems = await fetchCurateItemsByHash(market.hash);

      if (curateItems.length > 0) {
        const itemProps = await getDecodedParams(curateItems[0].id)
        setItemJson(itemProps.Details)
      }
    })();
  }, [market]);

  const data = useFormatMatches({events: events, itemJson: itemJson});

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
      <h2 style={{margin: '35px 0', fontSize: '33.18px', borderBottom: '1px solid #303030', paddingBottom: '20px'}}><Trans>Place your bet</Trans></h2>

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
                <Select
                  defaultValue={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ""}
                  id={`event-${i}-outcome-select`}
                  multiple={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
                  {...register(`outcomes.${i}.value`, {required: t`This field is required`})}
                  error={!!errors.outcomes?.[i]?.value}
                >
                  {events[i].outcomes.map((outcome, j) => {
                    if (data) {
                      const relatedQuestions: Array<string> = data[events[i].id] ?? [];
                      const possibleOutcomes: Array<string> = [];
                      for (let k = 0; k < relatedQuestions.length; k++) {
                        const questionId = relatedQuestions[k];
                        const questionPos = events.findIndex(event => event.id === questionId);
                        const userSelectionIndex = outcomes[questionPos].value;
                        if (userSelectionIndex !== "") {
                          const outcomeSelected = events[questionPos].outcomes[Number(userSelectionIndex)];
                          possibleOutcomes.push(outcomeSelected);
                        }
                      } 
                      if (possibleOutcomes.length >= 2 && !possibleOutcomes.includes(outcome)) {
                        return null;
                      }
                    }
                    return <MenuItem value={j} key={j}>{transOutcome(outcome)}</MenuItem>;
                  })}
                  <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
                </Select>
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
