import React, {useEffect, useState} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
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
import {useEvents} from "../../hooks/useEvents";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {getReferralKey, parseTitle, transOutcome} from "../../lib/helpers";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import {BigNumber} from "@ethersproject/bignumber";
import {useBetToken} from "../../hooks/useBetToken";
import CircularProgress from "@mui/material/CircularProgress";

export type BetFormValues = {
  outcomes: {value: number|''}[]
}

export const INVALID_RESULT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

type BetFormProps = {
  marketId: string
  price: BigNumberish
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
      <Button component={Link} href={`https://epor.io/tokens/${marketId}/${tokenId}?network=xDai`} target="_blank" rel="noopener"><Trans>Trade NFT in Eporio</Trans></Button>
    </div>
  </div>
}

export default function BetForm({marketId, price}: BetFormProps) {
  const { account, error: walletError } = useEthers();
  const { isLoading, error, data: events } = useEvents(marketId);
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
    return <Alert severity="error">{walletError?.message || <Trans>Connect your wallet to place a bet.</Trans>}</Alert>
  }

  if (error) {
    return <Alert severity="error"><Trans>Error loading events</Trans>.</Alert>
  }

  const onSubmit = async (data: BetFormValues) => {
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

  if (state.status === 'Mining') {
    return <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <div style={{width: '80%'}}><Trans>Event</Trans></div>
          <div style={{width: '20%'}}><Trans>Outcome</Trans></div>
        </BoxRow>
        {fields.map((field, i) => {
          if (!events || !events[i]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{parseTitle(events[i].title)}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`event-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: t`This field is required`})}
                >
                  {events[i].outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{transOutcome(outcome)}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
        })}
        <BoxRow>
          <Button type="submit" color="secondary"><Trans>Place Bet</Trans></Button>
        </BoxRow>
      </BoxWrapper>
    </form>
  );
}
