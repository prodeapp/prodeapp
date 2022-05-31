import {apolloProdeQuery} from "./apolloClient";
import {gtcrDecode, gtcrEncode} from "@kleros/gtcr-encoder";
import ipfsPublish from "./ipfs-publish";
import {CurateSubmitFormValues} from "../pages/CurateSubmit";

const FORMAT_SINGLE_ELIMINATION = 'single-elimination';
const FORMAT_DOUBLE_ELIMINATION = 'double-elimination';
const FORMAT_ROUND_ROBIN = 'round-robin';
const FORMAT_GROUPS = 'groups';
const FORMAT_UNCORRELATED = 'uncorrelated';
const FORMAT_OTHER = 'other';

export const TournamentFormats: Record<string, string> = {
  [FORMAT_SINGLE_ELIMINATION]: 'Single Elimination',
  [FORMAT_DOUBLE_ELIMINATION]: 'Double Elimination',
  [FORMAT_ROUND_ROBIN]: 'Round Robin',
  [FORMAT_GROUPS]: 'Groups',
  [FORMAT_UNCORRELATED]: 'Uncorrelated',
  [FORMAT_OTHER]: 'Other',
}

interface CurateListFields {
  Hash: string,
  JSON: string,
  StartingTimestamp: string,
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
    title: data.name,
    description: data.description,
    formats: [getTournamentFormat(data, questionsIds)]
  };

  const values: CurateListFields = {
    Hash: questionsHash,
    JSON: await ipfsPublish('tournament.json', JSON.stringify(json)),
    StartingTimestamp: data.startingTimestamp,
  }

  return gtcrEncode({ columns: await getRegistryColumns(), values })
}

export async function getDecodedParams(itemId: string): Promise<Record<string, any>> {
  const result = await apolloProdeQuery<{ curateItem: {data: string} }>(curateItemQuery, {itemId})

  if (!result?.data?.curateItem?.data) {
    throw new Error('item not found')
  }

  let columns = await getRegistryColumns()

  const decodedItems = gtcrDecode({ values: result?.data?.curateItem?.data, columns })

  const props: Record<string, any> = columns.reduce((obj, column, i) => {
    return {...obj, [column.label]: decodedItems[i]}
  }, {})

  if (props.JSON) {
    try {
      const response = await fetch(`https://ipfs.kleros.io${props.JSON}`);
      props.json = await response.json();
    } catch (e) {
      console.log('JSON error')
      props.JSON = {};
    }
  }

  return props;
}


function getTournamentFormat(data: CurateSubmitFormValues, questionsIds: string[]) {
  const format = {
    type: data.format,
    questions: questionsIds,
    extraData: {}
  }

  if ([FORMAT_ROUND_ROBIN, FORMAT_GROUPS].includes(data.format)) {
    // TODO: add extraData
  }

  return format;
}
