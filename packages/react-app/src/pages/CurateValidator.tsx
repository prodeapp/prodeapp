import React, {useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {DecodedCurateListFields, getDecodedParams} from "../lib/curate";
import {apolloProdeQuery} from "../lib/apolloClient";
import {
  Market,
  CurateItem,
  MARKET_FIELDS,
  CURATE_ITEM_FIELDS,
} from "../graphql/subgraph";
import Alert from "@mui/material/Alert";
import {getQuestionsHash} from "../lib/reality";
import {fetchEvents, useEvents} from "../hooks/useEvents";
import validate from "../components/Curate/schema";
import { Trans, t } from "@lingui/macro";

type FormValues = {
  itemId: string
}

export const fetchMarketByHash = async (hash: string) => {
  const query = `
    ${MARKET_FIELDS}
    query MarketQuery($hash: String) {
        markets(where: {hash: $hash}) {
            ...MarketFields
        }
    }
`;

  const response = await apolloProdeQuery<{ markets: Market[] }>(query, {hash});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.markets[0];
};

export const fetchCurateItemsByHash = async (hash: string) => {
  const query = `
    ${CURATE_ITEM_FIELDS}
    query CurateItemsQuery($hash: String) {
        curateItems(where: {hash: $hash}) {
            ...CurateItemFields
        }
    }
`;

  const response = await apolloProdeQuery<{ curateItems: CurateItem[] }>(query, {hash});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.curateItems;
};

interface ValidationResult {
  type: 'error' | 'success'
  message: string
}

function CurateValidator() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({defaultValues: {
      itemId: '',
    }});

  const [marketId, setMarketId] = useState('');
  const {data: events} = useEvents(marketId);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const onSubmit = async (data: FormValues) => {

    setMarketId('')

    const _results: ValidationResult[] = [];

    let itemProps: DecodedCurateListFields;

    try {
      itemProps = await getDecodedParams(data.itemId.toLowerCase());
    } catch (e) {
      setResults([{type: 'error', message: t`Item id not found`}]);
      return;
    }

    const isValid = validate(itemProps.JASON);

    _results.push(
      !isValid ? {type: 'error', message: t`Invalid JSON`} : {type: 'success', message: t`Valid JSON`}
    );

    // validate hash
    const market = await fetchMarketByHash(itemProps.Hash);

    if (!market) {
      _results.push({type: 'error', message: t`Market hash not found`});
    } else {
      _results.push({type: 'success', message: t`Market hash found`});

      const events = await fetchEvents(market.id);

      // validate hash
      _results.push(
        getQuestionsHash(events.map(event => event.id)) !== itemProps.Hash
          ? {type: 'error', message: t`Invalid market hash`}
          : {type: 'success', message: t`Valid market hash`}
      );

      // validate hash is not already registered
      const marketCurations = await fetchCurateItemsByHash(itemProps.Hash);

      _results.push(
        marketCurations.length > 1
          ? {type: 'error', message: t`This market has more than 1 submissions. ItemId's: ${marketCurations.map(tc => tc.id).join(', ')}`}
          : {type: 'success', message: t`This is the first submission for this market`}
      );

      // validate timestamp
      _results.push(
        Number(market.closingTime) <= Number(itemProps.Timestamp)
          ? {type: 'success', message: t`Valid starting timestamp`}
          : {type: 'error', message: t`Starting timestamp is earlier than the betting deadline`}
      );

      setMarketId(market.id)
    }

    setResults(_results);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans>Item Id</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('itemId', {
              required: t`This field is required.`
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="itemId" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button type="submit"><Trans>Validate</Trans></Button>
          </div>
        </BoxRow>
      </BoxWrapper>

      {results.map((result, i) => <Alert severity={result.type} key={i}>{result.message}</Alert>)}
      {events && events.map((event, i) => <div key={i} style={{margin: '10px 0'}}>{event.title}</div>)}
    </form>
  );
}

export default CurateValidator;
