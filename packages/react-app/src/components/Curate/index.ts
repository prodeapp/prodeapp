import { TournamentFormats } from '@/lib/curate'

export type CurateSubmitFormExtraDataGroups = {
	groups: {
		size: number
		name: string
	}[]
	rounds: number
}

export type CurateSubmitFormValues = {
	name: string
	description: string
	format: '' | TournamentFormats
	startingTimestamp: string
	questions: { value: string }[]
	extraDataGroups: CurateSubmitFormExtraDataGroups
}
