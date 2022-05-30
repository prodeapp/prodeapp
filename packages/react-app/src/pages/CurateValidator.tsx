import React from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {apolloCurateQuery} from "../lib/apolloClient";
const Ajv = require("ajv")

type FormValues = {
  itemId: string
}

type CurateItemProps = {label: string, value: string}[]

const query = `
    query ItemQuery ($itemId: String!) {
        items(where: {itemID: $itemId}) {
          props {
            label
            value
          }
        }
    }
`

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

const fetchCurateItemProps = async (itemId: string) => {

  const result = await apolloCurateQuery<{ litems: {props: CurateItemProps}[] }>(query, {itemId})

  if (!result || result.data.litems.length === 0) {
    return false;
  }

  const props: Record<string, any> = result.data.litems[0].props.reduce((obj, prop) => {
    return {...obj, [prop.label]: prop.value}
  }, {})

  if (props.json) {
    try {
      const response = await fetch(`https://ipfs.kleros.io${props.json}`);
      props.json = await response.json();
    } catch (e) {
      console.log('JSON error')
      props.json = {};
    }
  }

  return props;
}

function CurateValidator() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({defaultValues: {
      itemId: '',
    }});

  const onSubmit = async (data: FormValues) => {
    const itemProps = await fetchCurateItemProps(data.itemId.toLowerCase());

    if (!itemProps) {
      alert('Item id not found');
      return;
    }

    // validate json
    const ajv = new Ajv()
    const validate = ajv.compile(jsonSchema)

    if(!validate(itemProps.json)) {
      alert('Invalid JSON');
      return;
    }

    // TODO: check questions hash

    // TODO: check questions opening timestamp > starting timestamp

    // TODO: check questions hash already registered

    // TODO: show questions

    alert('OK!');
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
    </form>
  );
}

export default CurateValidator;
