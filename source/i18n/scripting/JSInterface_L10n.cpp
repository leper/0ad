/* Copyright (C) 2014 Wildfire Games.
 * This file is part of 0 A.D.
 *
 * 0 A.D. is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * 0 A.D. is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 0 A.D.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "precompiled.h"

#include "JSInterface_L10n.h"

#include "i18n/L10n.h"
#include "lib/utf8.h"
#include "ps/ConfigDB.h"

// Return the current locale code.
std::string JSI_L10n::GetCurrentLocale(ScriptInterface::CxPrivate* UNUSED(pCxPrivate))
{
	return L10n::Instance().GetCurrentLocale().getLanguage();
}

// Returns a translation of the specified English string into the current language.
std::wstring JSI_L10n::Translate(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::wstring sourceString)
{
	return wstring_from_utf8(L10n::Instance().Translate(utf8_from_wstring(sourceString)));
}

// Returns a translation of the specified English string, for the specified context.
std::wstring JSI_L10n::TranslateWithContext(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::string context, std::wstring sourceString)
{
	return wstring_from_utf8(L10n::Instance().TranslateWithContext(context, utf8_from_wstring(sourceString)));
}

// Return a translated version of the given strings (singular and plural) depending on an integer value.
std::wstring JSI_L10n::TranslatePlural(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::wstring singularSourceString, std::wstring pluralSourceString, int number)
{
	return wstring_from_utf8(L10n::Instance().TranslatePlural(utf8_from_wstring(singularSourceString), utf8_from_wstring(pluralSourceString), number));
}

// Return a translated version of the given strings (singular and plural) depending on an integer value, for the specified context.
std::wstring JSI_L10n::TranslatePluralWithContext(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::string context, std::wstring singularSourceString, std::wstring pluralSourceString, int number)
{
	return wstring_from_utf8(L10n::Instance().TranslatePluralWithContext(context, utf8_from_wstring(singularSourceString), utf8_from_wstring(pluralSourceString), number));
}

// Return a translated version of the given string, localizing it line by line.
std::wstring JSI_L10n::TranslateLines(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::wstring sourceString)
{
	return wstring_from_utf8(L10n::Instance().TranslateLines(utf8_from_wstring(sourceString)));
}

// Return a translated version of the items in the specified array.
std::vector<std::wstring> JSI_L10n::TranslateArray(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::vector<std::wstring> sourceArray)
{
	std::vector<std::wstring> translatedArray;
	for (std::vector<std::wstring>::iterator iterator = sourceArray.begin(); iterator != sourceArray.end(); ++iterator)
	{
		translatedArray.push_back(wstring_from_utf8(L10n::Instance().Translate(utf8_from_wstring(*iterator))));
	}
	return translatedArray;
}

// Return a localized version of a time given in milliseconds.
std::wstring JSI_L10n::FormatMillisecondsIntoDateString(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), UDate milliseconds, std::wstring formatString)
{
	return wstring_from_utf8(L10n::Instance().FormatMillisecondsIntoDateString(milliseconds, utf8_from_wstring(formatString)));
}

// Return a localized version of the given decimal number.
std::wstring JSI_L10n::FormatDecimalNumberIntoString(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), double number)
{
	return wstring_from_utf8(L10n::Instance().FormatDecimalNumberIntoString(number));
}

// Return a translated version of the given decimal number.
std::wstring JSI_L10n::MarkToTranslate(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::wstring sourceString)
{
	return sourceString;
}

std::vector<std::string> JSI_L10n::GetSupportedLocaleCodes(ScriptInterface::CxPrivate* UNUSED(pCxPrivate))
{
	return L10n::Instance().GetSupportedLocaleCodes();
}

std::vector<std::wstring> JSI_L10n::GetSupportedLocaleDisplayNames(ScriptInterface::CxPrivate* UNUSED(pCxPrivate))
{
	return L10n::Instance().GetSupportedLocaleDisplayNames();
}

int JSI_L10n::GetCurrentLocaleIndex(ScriptInterface::CxPrivate* UNUSED(pCxPrivate))
{
	return L10n::Instance().GetCurrentLocaleIndex();
}

void JSI_L10n::SetLocale(ScriptInterface::CxPrivate* UNUSED(pCxPrivate), std::string locale)
{
	// TODO: Use the ConfigDB functions exposed to js to change the config value
	// Save the new locale in the settings file.
	g_ConfigDB.SetValueString(CFG_USER, "locale", locale);
	g_ConfigDB.WriteFile(CFG_USER);

	// Reload the localization singleton to use the selected locale.
	L10n::Instance().SetCurrentLocale(locale);
}

void JSI_L10n::RegisterScriptFunctions(ScriptInterface& scriptInterface)
{
	scriptInterface.RegisterFunction<std::string, &GetCurrentLocale>("GetCurrentLocale");
	scriptInterface.RegisterFunction<std::wstring, std::wstring, &Translate>("Translate");
	scriptInterface.RegisterFunction<std::wstring, std::string, std::wstring, &TranslateWithContext>("TranslateWithContext");
	scriptInterface.RegisterFunction<std::wstring, std::wstring, std::wstring, int, &TranslatePlural>("TranslatePlural");
	scriptInterface.RegisterFunction<std::wstring, std::string, std::wstring, std::wstring, int, &TranslatePluralWithContext>("TranslatePluralWithContext");
	scriptInterface.RegisterFunction<std::wstring, std::wstring, &TranslateLines>("TranslateLines");
	scriptInterface.RegisterFunction<std::vector<std::wstring>, std::vector<std::wstring>, &TranslateArray>("TranslateArray");
	scriptInterface.RegisterFunction<std::wstring, UDate, std::wstring, &FormatMillisecondsIntoDateString>("FormatMillisecondsIntoDateString");
	scriptInterface.RegisterFunction<std::wstring, double, &FormatDecimalNumberIntoString>("FormatDecimalNumberIntoString");
	scriptInterface.RegisterFunction<std::wstring, std::wstring, &MarkToTranslate>("MarkToTranslate");
	scriptInterface.RegisterFunction<std::vector<std::string>, &GetSupportedLocaleCodes>("GetSupportedLocaleCodes");
	scriptInterface.RegisterFunction<std::vector<std::wstring>, &GetSupportedLocaleDisplayNames>("GetSupportedLocaleDisplayNames");
	scriptInterface.RegisterFunction<int, &GetCurrentLocaleIndex>("GetCurrentLocaleIndex");
	scriptInterface.RegisterFunction<void, std::string, &SetLocale>("SetLocale");
}
