import { Dispatch } from 'react';

/**
 * Assertion function
 */
export function assert(value: unknown, message: string | Error): asserts value {
	if (!value) throw message instanceof Error ? message : new Error(message);
}

export interface I18nContextProps {
	locale: LocaleEnum;
	handleChangeLocale: Dispatch<LocaleEnum>;
}

export enum LocaleEnum {
	English = 'en',
	Spanish = 'es',
}

declare module '@mui/material/styles' {
	interface Palette {
		black: Palette['primary'];
	}
	interface PaletteOptions {
		black: PaletteOptions['primary'];
	}
	interface TypographyVariants {
		p1: React.CSSProperties;
		p2: React.CSSProperties;
		p3: React.CSSProperties;
		h1s: React.CSSProperties;
		h4s: React.CSSProperties;
		h6s: React.CSSProperties;
	}

	// allow configuration using `createTheme`
	interface TypographyVariantsOptions {
		p1?: React.CSSProperties;
		p2?: React.CSSProperties;
		p3?: React.CSSProperties;
		h1s?: React.CSSProperties;
		h4s?: React.CSSProperties;
		h6s?: React.CSSProperties;
	}
}

declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		p1: true;
		p2: true;
		p3: true;
		h1s: true;
		h4s: true;
		h6s: true;
	}
}
