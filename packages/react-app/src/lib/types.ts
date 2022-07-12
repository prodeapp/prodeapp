import { Dispatch } from "react";

/**
 * Assertion function
 */
export function assert(value: unknown, message: string | Error): asserts value {
  if (!value) throw message instanceof Error ? message : new Error(message);
}

export interface I18nContextProps {
  locale: LocaleEnum,
  handleChangeLocale: Dispatch<LocaleEnum>
}

export enum LocaleEnum {
  English = 'en',
  Spanish = 'es'
}