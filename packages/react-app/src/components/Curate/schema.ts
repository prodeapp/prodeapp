import Ajv from 'ajv';

const CURATE_SCHEMA = {
	type: 'object',
	definitions: {
		BaseFormat: {
			type: 'object',
			properties: {
				questions: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'string',
					},
				},
			},
			required: ['questions'],
		},
		// formats without extra data
		FormatSimple: {
			type: 'object',
			allOf: [{ $ref: '#/definitions/BaseFormat' }],
			properties: {
				type: {
					type: 'string',
					enum: ['single-elimination', 'double-elimination', 'gsl'],
				},
			},
		},
		FormatGroups: {
			type: 'object',
			allOf: [{ $ref: '#/definitions/BaseFormat' }],
			properties: {
				type: {
					type: 'string',
					const: 'groups',
				},
				extraData: {
					type: 'object',
					properties: {
						sizes: {
							type: 'array',
							items: {
								type: 'number',
							},
						},
						names: {
							type: 'array',
							items: {
								type: 'string',
							},
						},
						rounds: {
							type: 'number',
						},
					},
					required: ['sizes'],
				},
			},
		},
	},
	properties: {
		description: { type: 'string' },
		formats: {
			type: 'array',
			minItems: 1,
			items: {
				anyOf: [
					{ $ref: '#/definitions/FormatSimple' },
					{ $ref: '#/definitions/FormatGroups' },
				],
			},
		},
	},
	required: ['formats'],
	additionalProperties: false,
};

// validate json
const ajv = new Ajv();

const validate = ajv.compile(CURATE_SCHEMA);

export default validate;
