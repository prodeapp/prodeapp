import {apolloProdeQuery} from "./apolloClient";
import {gtcrDecode, gtcrEncode} from "@kleros/gtcr-encoder";
import ipfsPublish from "./ipfs-publish";
import {CurateSubmitFormValues} from "../components/Curate";
import validate from "../components/Curate/schema";

export const FORMAT_SINGLE_ELIMINATION = 'single-elimination';
export const FORMAT_DOUBLE_ELIMINATION = 'double-elimination';
export const FORMAT_GROUPS = 'groups';

export const TournamentFormats: Record<string, string> = {
  [FORMAT_SINGLE_ELIMINATION]: 'Single Elimination',
  [FORMAT_DOUBLE_ELIMINATION]: 'Double Elimination',
  [FORMAT_GROUPS]: 'Groups',
}

interface CurateListFields {
  Title: string,
  Hash: string,
  JASON: string,
  Timestamp: string,
}

export interface DecodedCurateListFields extends Omit<CurateListFields, 'JASON'> {
  JASON: Record<string, any>
}

const registryQuery = `
    query RegistryQuery ($registryId: String!) {
        registry(id: $registryId) {
          clearingMetaEvidence {
            URI
          }
        }
    }
`

const curateItemQuery = `
    query CurateItemQuery ($itemId: String!) {
        curateItem(id: $itemId) {
          data
        }
    }
`

async function getRegistryColumns(): Promise<any[]> {
  const result = await apolloProdeQuery<{ registry: {clearingMetaEvidence: {URI: string}} }>(registryQuery, {registryId: process.env.REACT_APP_CURATE_REGISTRY as string})

  if (!result?.data?.registry?.clearingMetaEvidence?.URI) {
    throw new Error('Missing registry meta evidence URI');
  }

  try {
    const response = await fetch(`https://ipfs.kleros.io${result.data.registry.clearingMetaEvidence.URI}`);
    const metadata = await response.json();
    return metadata.metadata.columns;
  } catch (e) {
    throw new Error('Error reading registry meta evidence columns');
  }
}

export async function getEncodedParams(data: CurateSubmitFormValues, questionsHash: string, questionsIds: string[]) {
  const json = {
    description: data.description,
    formats: [getTournamentFormat(data, questionsIds)]
  };

  const isValid = validate(json);

  if (!isValid) {
    throw new Error('Invalid JSON schema')
  }

  const values: CurateListFields = {
    Title: data.name,
    Hash: questionsHash,
    Timestamp: data.startingTimestamp,
    JASON: await ipfsPublish('market.json', JSON.stringify(json)),
  }

  return gtcrEncode({ columns: await getRegistryColumns(), values })
}

export async function getDecodedParams(itemId: string): Promise<DecodedCurateListFields> {
  const result = await apolloProdeQuery<{ curateItem: {data: string} }>(curateItemQuery, {itemId})

  if (!result?.data?.curateItem?.data) {
    throw new Error('item not found')
  }

  let columns = await getRegistryColumns()

  const decodedItems = gtcrDecode({ values: result?.data?.curateItem?.data, columns })

  const props: DecodedCurateListFields = columns.reduce((obj, column, i) => {
    return {...obj, [column.label]: decodedItems[i]}
  }, {})

  if (props.JASON) {
    try {
      const response = await fetch(`https://ipfs.kleros.io${props.JASON}`);
      props.JASON = await response.json();
    } catch (e) {
      console.log('JSON error')
      props.JASON = {};
    }
  }

  return props ;
}


function getTournamentFormat(data: CurateSubmitFormValues, questionsIds: string[]) {
  const format = {
    type: data.format,
    questions: questionsIds,
    extraData: {},
  }

  if (data.format === FORMAT_GROUPS) {
    format.extraData = {
      sizes: data.extraDataGroups.groups.map(g => g.size),
      names: data.extraDataGroups.groups.map(g => g.name),
      rounds: data.extraDataGroups.rounds
    };
  }

  return format;
}
