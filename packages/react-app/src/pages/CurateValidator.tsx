import React, {useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {getDecodedParams} from "../lib/curate";
import {apolloProdeQuery} from "../lib/apolloClient";
import {
  Tournament,
  TOURNAMENT_CURATION_FIELDS,
  TOURNAMENT_FIELDS, TournamentCuration
} from "../graphql/subgraph";
import Alert from "@mui/material/Alert";
import {getQuestionsHash} from "../lib/reality";
import {fetchMatches} from "../hooks/useMatches";
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
    title: {type: "string"},
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
  required: ["title", "formats"],
  additionalProperties: false
}

export const fetchTournamentByHash = async (hash: string) => {
  const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentQuery($hash: String) {
        tournaments(where: {hash: $hash}) {
            ...TournamentFields
        }
    }
`;

  const response = await apolloProdeQuery<{ tournaments: Tournament[] }>(query, {hash});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.tournaments[0];
};

export const fetchTournamentCurationsByHash = async (hash: string) => {
  const query = `
    ${TOURNAMENT_CURATION_FIELDS}
    query TournamentCurationQuery($hash: String) {
        tournamentCurations(where: {hash: $hash}) {
            ...TournamentCurationFields
        }
    }
`;

  const response = await apolloProdeQuery<{ tournamentCurations: TournamentCuration[] }>(query, {hash});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.tournamentCurations;
};

interface ValidationResult {
  type: 'error' | 'success'
  message: string
}

function CurateValidator() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({defaultValues: {
      itemId: '',
    }});

  const [tournamentId, setTournamentId] = useState('');
  const {data: questions} = useQuestions(tournamentId);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const onSubmit = async (data: FormValues) => {

    setTournamentId('')

    const _results: ValidationResult[] = [];

    let itemProps: Record<string, any> = {};

    try {
      itemProps = await getDecodedParams(data.itemId.toLowerCase());
    } catch (e) {
      setResults([{type: 'error', message: 'Item id not found'}]);
      return;
    }

    // validate json
    const ajv = new Ajv()
    const validate = ajv.compile(jsonSchema)

    const isValid = validate(itemProps.json);

    console.log('errors', validate.errors)
    _results.push(
      (!isValid && {type: 'error', message: 'Invalid JSON'}) || {type: 'success', message: 'Valid JSON'}
    );

    // validate hash
    const tournament = await fetchTournamentByHash(itemProps.Hash);

    if (!tournament) {
      _results.push({type: 'error', message: 'Tournament hash not found'});
    } else {
      _results.push({type: 'success', message: 'Tournament hash found'});

      const matches = await fetchMatches(tournament.id);

      // validate hash
      _results.push(
        (getQuestionsHash(matches.map(match => match.questionID)) !== itemProps.Hash
          && {type: 'error', message: 'Invalid tournament hash'})
        || {type: 'success', message: 'Valid tournament hash'}
      );

      // validate hash is not already registered
      const tournamentCurations = await fetchTournamentCurationsByHash(itemProps.Hash);

      _results.push(
        (tournamentCurations.length > 1
          && {type: 'error', message: `This tournament has more than 1 submissions. ItemId's: ${tournamentCurations.map(tc => tc.id).join(', ')}`})
        || {type: 'success', message: 'This is the first submission for this tournament'}
      );

      // validate timestamp

      const earliestMatch = matches.reduce((prev, curr) => Number(prev.openingTs) < Number(curr.openingTs) ? prev : curr)

      _results.push(
        (Number(earliestMatch.openingTs) > Number(itemProps.StartingTimestamp)
          && {type: 'error', message: 'Starting timestamp is greater than the earliest match'})
        || {type: 'success', message: 'Valid starting timestamp'}
      );

      setTournamentId(tournament.id)
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
