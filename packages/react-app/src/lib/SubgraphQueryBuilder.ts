function filterObject<T>(obj: Record<string, T>, callback: (v: T, k: string) => Boolean) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => callback(val, key))
  )
}

export type QueryVariables = Record<string, string | boolean | undefined>;

export function buildQuery(query: string, variables: QueryVariables) {
  variables = filterObject(variables, val => val !== undefined);

  const params = Object.entries(variables).map(([k, v]) => `$${k}: ${typeof v === 'string' ? 'String' : 'Boolean'}`).join(', ')
  const where = Object.entries(variables).map(([k, v]) => `${k}: $${k}`).join(', ')

  return query
    .replace('#where#', where)
    .replace('(#params#)', params !== '' ? `(${params})` : '');
}