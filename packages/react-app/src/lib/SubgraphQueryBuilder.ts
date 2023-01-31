function filterObject<T>(obj: Record<string, T>, callback: (v: T, k: string) => boolean) {
	return Object.fromEntries(Object.entries(obj).filter(([key, val]) => callback(val, key)))
}

type QueryValue = string | string[] | boolean | undefined
export type QueryVariables = Record<string, QueryValue>

const getType = (v: QueryValue): string => {
	if (typeof v === 'string') {
		return 'String'
	}

	if (Array.isArray(v)) {
		return '[String]'
	}

	return 'Boolean'
}

export function buildQuery(query: string, variables: QueryVariables) {
	variables = filterObject(variables, val => val !== undefined)

	const params = Object.entries(variables)
		.map(([k, v]) => `$${k}: ${getType(v)}`)
		.join(', ')

	const where = Object.entries(variables)
		// this fields are used only for params
		.filter(v => !['orderBy', 'orderDirection'].includes(v[0]))
		.map(([k, _]) => `${k}: $${k}`)
		.join(', ')

	return query.replace('#where#', where).replace('(#params#)', params !== '' ? `(${params})` : '')
}
