import { Address } from '@wagmi/core'

export const paths = {
	market: (id: Address | string, chainId: number) => `/markets/${chainId}/${id.toString()}/`,
}
