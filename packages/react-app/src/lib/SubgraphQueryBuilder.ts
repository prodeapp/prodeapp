function filterObject<T>(obj: Record<string, T>, callback: (v: T, k: string) => boolean) {
	return Object.fromEntries(Object.entries(obj).filter(([key, val]) => callback(val, key)))
}

type QueryScalarValues = string | string[] | boolean | undefined
type QueryValue = QueryScalarValues | Record<string, QueryScalarValues>
export type QueryVariables = Record<string, QueryValue>

const getType = (v: QueryScalarValues): string => {
	if (typeof v === 'string') {
		return 'String'
	}

	if (Array.isArray(v)) {
		return '[String]'
	}

	return 'Boolean'
}

type ParsedVars = Record<string, { type: string; value: QueryScalarValues }>

const parseParams = (variables: QueryVariables, current: ParsedVars): ParsedVars => {
	return Object.entries(variables).reduce((acumm, curr) => {
		if (typeof curr[1] === 'object' && !Array.isArray(curr[1])) {
			return parseParams(curr[1], current)
		}

		acumm[curr[0]] = { type: getType(curr[1]), value: curr[1] }

		return acumm
	}, current)
}

const parseWhere = (variables: QueryVariables, current: string[]): string => {
	return (
		'{' +
		Object.entries(variables)
			.reduce((acumm, curr) => {
				if (['orderBy', 'orderDirection'].includes(curr[0])) {
					// these fields are used only for params
					return acumm
				}

				if (typeof curr[1] === 'object' && !Array.isArray(curr[1])) {
					acumm.push(`${curr[0]}: ${parseWhere(curr[1], [])}`)
					return acumm
				}

				acumm.push(`${curr[0]}: $${curr[0]}`)

				return acumm
			}, current)
			.join(', ') +
		'}'
	)
}

export function buildQuery(
	query: string,
	variables: QueryVariables
): { query: string; variables: Record<string, any> } {
	variables = filterObject(variables, (val) => val !== undefined)

	const paramsEntries = Object.entries(parseParams(variables, {}))

	const params = paramsEntries.map(([k, v]) => `$${k}: ${v.type}`).join(', ')

	const where = parseWhere(variables, [])

	return {
		query: query.replace('#where#', where).replace('(#params#)', params !== '' ? `(${params})` : ''),
		variables: paramsEntries.reduce((acum, curr) => {
			acum[curr[0]] = curr[1].value
			return acum
		}, {} as Record<string, any>),
	}
}
