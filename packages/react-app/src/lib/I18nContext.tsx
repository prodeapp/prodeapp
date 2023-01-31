import React, { useContext } from 'react';

import { I18nContextProps, LocaleEnum } from './types';

const InitialState: I18nContextProps = {
	locale: LocaleEnum.English,
	handleChangeLocale: () => undefined,
};

export const I18nContext = React.createContext<I18nContextProps>(InitialState);

export const useI18nContext = (): I18nContextProps => {
	const context = useContext<I18nContextProps>(I18nContext);

	if (context === null) {
		throw new Error(
			'"useI18nContext" should be used inside a "I18nContextProvider"'
		);
	}

	return context;
};
