import { BigNumber } from 'ethers/lib'
import { getAddress, RLP, toUtf8Bytes, toUtf8String } from 'ethers/lib/utils'

import { solidityTypes, typeToSolidity } from './item-types'

interface Column {
	type: string
	label: string
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const MAX_SIGNED_INTEGER = BigNumber.from(1).shl(255).sub(1).toString() //  int(~(uint(1) << 255))
export const MIN_SIGNED_INTEGER = BigNumber.from(1).shl(255).mul(-1).toString() // int(uint(1) << 255)

export const gtcrEncode = ({ columns, values }: { columns: Column[]; [values: string]: any }): string => {
	const itemArr = columns.map((col) => {
		switch (typeToSolidity[col.type]) {
			case solidityTypes.STRING:
				return toUtf8Bytes((values[col.label] as string) || '')
			case solidityTypes.INT256: {
				return BigNumber.from(values[col.label] || '0')
					.toTwos(256)
					.toHexString()
			}
			case solidityTypes.ADDRESS:
				return values[col.label] ? values[col.label] : ZERO_ADDRESS
			case solidityTypes.BOOL:
				return BigNumber.from(values[col.label] ? 1 : 0).toHexString()
			default:
				throw new Error(`Unhandled item type ${col.type}`)
		}
	})

	return RLP.encode(itemArr)
}

const padAddr = (rawAddr: string) => {
	rawAddr = rawAddr.startsWith('0x') ? rawAddr.slice(2) : rawAddr
	return `${'0'.repeat(40 - rawAddr.length)}${rawAddr}`
}

export const gtcrDecode = ({ columns, values }: { columns: Column[]; values: any }): (string | boolean)[] => {
	const item = RLP.decode(values) as any
	return columns.map((col, i) => {
		try {
			switch (typeToSolidity[col.type]) {
				case solidityTypes.STRING: {
					return toUtf8String(item[i])
				}
				case solidityTypes.INT256:
					return BigNumber.from(item[i]).fromTwos(256).toString()
				case solidityTypes.ADDRESS: {
					// If addresses are small, we must left pad them with zeroes
					const rawAddr = item[i].toString('hex')
					return getAddress(`0x${padAddr(rawAddr)}`)
				}
				case solidityTypes.BOOL:
					return Boolean(BigNumber.from(item[i]).toNumber())
				default:
					throw new Error(`Unhandled item type ${col.type}`)
			}
		} catch (err) {
			console.error(`Error decoding ${col.type}`, err)
			return `Error decoding ${col.type}`
		}
	})
}
