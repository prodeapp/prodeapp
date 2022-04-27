function filterObject<T>(obj: Record<string, T>, callback: (v: T, k: string) => Boolean) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => callback(val, key))
  )
}

export function buildQuery(query: string, variables: Record<string, string | undefined>) {
  variables = filterObject(variables, Boolean);

  const params = Object.entries(variables).map(([k, v]) => `$${k}: String`).join(', ')
  const where = Object.entries(variables).map(([k, v]) => `${k}: $${k}`).join(', ')

  return query
    .replace('#where#', where)
    .replace('#params#', params);
}