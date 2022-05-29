import {apolloCurateQuery} from "./apolloClient";
import {gtcrEncode} from "@kleros/gtcr-encoder";
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

const query = `
    query RegistryQuery ($registryId: String!) {
        lregistry(id: $registryId) {
          clearingMetaEvidence {
            URI
          }
        }
    }
`

export async function getEncodedParams(data: CurateSubmitFormValues, questionsHash: string, questionsIds: string[]) {
  const result = await apolloCurateQuery<{ lregistry: {clearingMetaEvidence: {URI: string}} }>(query, {registryId: process.env.REACT_APP_CURATE_REGISTRY as string})

  if (!result?.data?.lregistry?.clearingMetaEvidence?.URI) {
    console.log('Missing registry meta evidence URI');
    return '';
  }

  let columns: any[] = [];

  try {
    const response = await fetch(`https://ipfs.kleros.io${result.data.lregistry.clearingMetaEvidence.URI}`);
    const metadata = await response.json();
    columns = metadata.metadata.columns;
  } catch (e) {
    console.log('Error reading registry meta evidence columns');
    return '';
  }

  const json = {
    title: data.name,
    description: data.description,
    formats: [getTournamentFormat(data, questionsIds)]
  };

  let fileURI = '';

  try {
    fileURI = await ipfsPublish('tournament.json', JSON.stringify(json))
  } catch (err) {
    console.error('Curate json error', err);
    return '';
  }

  const values = {
    name: data.name,
    hash: questionsHash,
    json: fileURI,
  }

  return gtcrEncode({ columns, values })
}

function getTournamentFormat(data: CurateSubmitFormValues, questionsIds: string[]) {
  const format = {
    type: data.format,
    questions: questionsIds,
    extraData: {}
  }

  if (![FORMAT_ROUND_ROBIN, FORMAT_GROUPS].includes(data.format)) {
    // TODO: add extraData
  }

  return format;
}
