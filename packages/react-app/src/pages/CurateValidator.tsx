import React, {useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import Input from '@mui/material/Input';
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
import {fetchEvents} from "../hooks/useEvents";
import {useQuestions} from "../hooks/useQuestions";
const Ajv = require("ajv")

type FormValues = {
  itemId: string
}

const jsonSchema = {
  type: "object",
  definitions: {
    BaseFormat: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          minItems: 1,
          items: {
            type: "string",
          }
        }
      },
      required: ["questions"]
    },
    // formats without extra data
    FormatSimple: {
      type: "object",
      allOf: [
        {"$ref": "#/definitions/BaseFormat"},
      ],
      properties: {
        type: {
          type: "string",
          enum: ["single-elimination", "double-elimination", "uncorrelated", "other"],
        },
      },
    },
    FormatRoundRobin: {
      type: "object",
      allOf: [
        {"$ref": "#/definitions/BaseFormat"},
      ],
      properties: {
        type: {
          type: "string",
          const: "round-robin",
        },
        extraData: {
          type: "object",
          properties: {
            totalTournaments: {
              type: "number",
            },
            competitors: {
              type: "number",
            },
            rounds: {
              type: "number",
            },
            names: {
              type: "array",
              items: {
                type: "string",
              }
            }
          },
          required: ["totalTournaments", "competitors", "rounds"]
        },
      },
    },
    FormatGroups: {
      type: "object",
      allOf: [
        {"$ref": "#/definitions/BaseFormat"},
      ],
      properties: {
        type: {
          type: "string",
          const: "groups",
        },
        extraData: {
          type: "object",
          properties: {
            groups: {
              anyOf: [
                {type: "number"},
                {type: "array", items: {type: "number"}},
              ],
            },
            names: {
              type: "array",
              items: {
                type: "string",
              }
            }
          },
          required: ["groups"],
        },

      },
    },
  },
  properties: {
    description: {type: "string"},
    formats: {
      type: "array",
      minItems: 1,
      items: {
        anyOf: [
          {"$ref": "#/definitions/FormatSimple"},
          {"$ref": "#/definitions/FormatRoundRobin"},
          {"$ref": "#/definitions/FormatGroups"},
        ],
      },
    },
  },
  required: ["formats"],
  additionalProperties: false
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
  const {data: questions} = useQuestions(marketId);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const onSubmit = async (data: FormValues) => {

    setMarketId('')

    const _results: ValidationResult[] = [];

    let itemProps: DecodedCurateListFields;

    try {
      itemProps = await getDecodedParams(data.itemId.toLowerCase());
    } catch (e) {
      setResults([{type: 'error', message: 'Item id not found'}]);
      return;
    }

    // validate json
    const ajv = new Ajv()
    const validate = ajv.compile(jsonSchema)

    const isValid = validate(itemProps.JASON);

    _results.push(
      !isValid ? {type: 'error', message: 'Invalid JSON'} : {type: 'success', message: 'Valid JSON'}
    );

    // validate hash
    const market = await fetchMarketByHash(itemProps.Hash);

    if (!market) {
      _results.push({type: 'error', message: 'Market hash not found'});
    } else {
      _results.push({type: 'success', message: 'Market hash found'});

      const events = await fetchEvents(market.id);

      // validate hash
      _results.push(
        getQuestionsHash(events.map(event => event.questionID)) !== itemProps.Hash
          ? {type: 'error', message: 'Invalid market hash'}
          : {type: 'success', message: 'Valid market hash'}
      );

      // validate hash is not already registered
      const marketCurations = await fetchCurateItemsByHash(itemProps.Hash);

      _results.push(
        marketCurations.length > 1
          ? {type: 'error', message: `This market has more than 1 submissions. ItemId's: ${marketCurations.map(tc => tc.id).join(', ')}`}
          : {type: 'success', message: 'This is the first submission for this market'}
      );

      // validate timestamp
      _results.push(
        Number(market.closingTime) <= Number(itemProps.Timestamp)
          ? {type: 'success', message: 'Valid starting timestamp'}
          : {type: 'error', message: 'Starting timestamp is earlier than the betting deadline'}
      );

      setMarketId(market.id)
    }

    setResults(_results);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Item Id</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('itemId', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="itemId" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button type="submit">Validate</Button>
          </div>
        </BoxRow>
      </BoxWrapper>

      {results.map((result, i) => <Alert severity={result.type} key={i}>{result.message}</Alert>)}
      {questions && Object.values(questions).map((question, i) => <div key={i} style={{margin: '10px 0'}}>{question.qTitle}</div>)}
    </form>
  );
}

export default CurateValidator;
