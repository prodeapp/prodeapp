import { gtcrDecode, gtcrEncode } from '@kleros/gtcr-encoder'

import { Bytes } from '@/abi/types'
import { CurateSubmitFormValues } from '@/components/Curate'
import validate from '@/components/Curate/schema'
import { CURATE_ITEM_FIELDS, CurateItem } from '@/graphql/subgraph'
import { getConfigAddress } from '@/lib/config'

import { apolloProdeQuery } from './apolloClient'
import ipfsPublish from './ipfs-publish'

export const FORMAT_SINGLE_ELIMINATION = 'single-elimination'
export const FORMAT_DOUBLE_ELIMINATION = 'double-elimination'
export const FORMAT_GROUPS = 'groups'
export const FORMAT_GSL = 'gsl'

export const TOURNAMENT_FORMATS: Record<string, string> = {
	[FORMAT_SINGLE_ELIMINATION]: 'Single Elimination',
	[FORMAT_DOUBLE_ELIMINATION]: 'Double Elimination',
	[FORMAT_GROUPS]: 'Groups',
	[FORMAT_GSL]: 'GSL',
}

export type TournamentFormats = keyof typeof TOURNAMENT_FORMATS

interface CurateListFields {
	Title: string
	Hash: string
	Details: string
	'Starting timestmap': string
}

export interface DecodedCurateListFields extends Omit<CurateListFields, 'Details'> {
	Details: Record<string, any>
}

export interface ExtraDataGroups {
	sizes: number[]
	names: string[]
	rounds: number
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

async function getRegistryColumns(chainId: number): Promise<any[]> {
	const result = await apolloProdeQuery<{
		registry: { clearingMetaEvidence: { URI: string } }
	}>(chainId, registryQuery, {
		registryId: getConfigAddress('CURATE_REGISTRY', chainId).toLowerCase(),
	})

	if (!result?.data?.registry?.clearingMetaEvidence?.URI) {
		throw new Error('Missing registry meta evidence URI')
	}

	try {
		const response = await fetch(`https://ipfs.kleros.io${result.data.registry.clearingMetaEvidence.URI}`)
		const metadata = await response.json()
		return metadata.metadata.columns
	} catch (e) {
		throw new Error('Error reading registry meta evidence columns')
	}
}

export async function getEncodedParams(
	chainId: number,
	data: CurateSubmitFormValues,
	questionsHash: string,
	questionsIds: string[]
): Promise<Bytes> {
	const json = {
		description: data.description,
		formats: [getTournamentFormat(data, questionsIds)],
	}

	const isValid = validate(json)

	if (!isValid) {
		throw new Error('Invalid JSON schema')
	}

	const values: CurateListFields = {
		Title: data.name,
		Hash: questionsHash,
		'Starting timestmap': data.startingTimestamp,
		Details: await ipfsPublish('market.json', JSON.stringify(json)),
	}

	return gtcrEncode({ columns: await getRegistryColumns(chainId), values }) as Bytes
}

export async function getDecodedParams(chainId: number, itemId: string): Promise<DecodedCurateListFields> {
	const result = await apolloProdeQuery<{ curateItem: { data: string } }>(chainId, curateItemQuery, { itemId })

	if (!result?.data?.curateItem?.data) {
		throw new Error('item not found')
	}

	const columns = await getRegistryColumns(chainId)

	const decodedItems = gtcrDecode({
		values: result?.data?.curateItem?.data,
		columns,
	})

	const props: DecodedCurateListFields = columns.reduce((obj, column, i) => {
		return { ...obj, [column.label]: decodedItems[i] }
	}, {})

	if (props.Details) {
		try {
			const response = await fetch(`https://ipfs.kleros.io${props.Details}`)
			props.Details = await response.json()
		} catch (e) {
			console.log('JSON error')
			props.Details = {}
		}
	}

	return props
}

export function convertExtraDataGroups(extraDataGroups: CurateSubmitFormValues['extraDataGroups']): ExtraDataGroups {
	return {
		sizes: extraDataGroups.groups.map(g => g.size),
		names: extraDataGroups.groups.map(g => g.name),
		rounds: extraDataGroups.rounds,
	}
}

function getTournamentFormat(data: CurateSubmitFormValues, questionsIds: string[]) {
	const format = {
		type: data.format,
		questions: questionsIds,
		extraData: {},
	}

	if (data.format === FORMAT_GROUPS) {
		format.extraData = convertExtraDataGroups(data.extraDataGroups)
	}

	return format
}

export const fetchCurateItemsByHash = async (chainId: number, hash: string) => {
	const query = `
    ${CURATE_ITEM_FIELDS}
    query CurateItemsQuery($hash: String) {
        curateItems(where: {hash: $hash}) {
            ...CurateItemFields
        }
    }
`

	const response = await apolloProdeQuery<{ curateItems: CurateItem[] }>(chainId, query, { hash })

	if (!response) throw new Error('No response from TheGraph')

	return response.data.curateItems
}
