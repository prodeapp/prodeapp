import { i18n } from '@lingui/core'
import { detect, fromNavigator, fromStorage } from '@lingui/detect-locale'
import { I18nProvider as LinguiI18nProvider } from '@lingui/react'
// import plural rules for all locales
import { en, es } from 'make-plural'
import React, { useCallback, useEffect, useState } from 'react'

import { I18nContext } from './I18nContext'
import { LocaleEnum } from './types'

i18n.loadLocaleData({
	en: { plurals: en },
	es: { plurals: es },
})

const detectLocale = () => {
	const navigatorLanguage = fromNavigator().substring(0, 2)
	return {
		storage: detect(fromStorage('lang', { useSessionStorage: false }), navigatorLanguage),
	}
}

const isLocalePresent = (locale: string) => {
	let isPresent = false
	Object.values(LocaleEnum).forEach((enumLocaleValue) => {
		if (enumLocaleValue === locale) {
			isPresent = true
		}
	})

	return isPresent
}

export const I18nProvider: React.FC = ({ children }) => {
	const [locale, setLocale] = useState(LocaleEnum.English)

	const setLocaleIfPresent = useCallback((locale: string) => {
		if (isLocalePresent(locale)) {
			setLocale(locale as LocaleEnum)
		}
	}, [])

	useEffect(() => {
		const { storage } = detectLocale()

		// if previously data was saved to storage
		if (storage) {
			setLocaleIfPresent(storage)
		}
	}, [setLocaleIfPresent])

	const handleChangeLocale = (locale: LocaleEnum) => {
		localStorage.setItem('lang', locale)
		setLocale(locale)
	}

	useEffect(() => {
		// Dynamically load the catalogs
		import(`../locales/${locale}.mjs`).then((module) => {
			const messages = module.messages
			i18n.load(locale, messages)
			i18n.activate(locale)
		})
	}, [locale])

	return (
		<I18nContext.Provider
			value={{
				locale,
				handleChangeLocale,
			}}
		>
			<LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>
		</I18nContext.Provider>
	)
}
