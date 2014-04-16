/* Copyright (c) 2014 Wildfire Games
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef L10N_H
#define L10N_H

#include <string>
#include <vector>

#include "lib/code_annotation.h"
#include "lib/external_libraries/icu.h"
#include "lib/external_libraries/tinygettext.h"

#include "lib/file/vfs/vfs_path.h"

class L10n
{
	NONCOPYABLE(L10n);
public:

	L10n();
	~L10n();

	enum DateTimeType { DateTime, Date, Time };

	static L10n& Instance();

	Locale GetCurrentLocale();
	void SetCurrentLocale(const std::string& localeCode);
	void SetCurrentLocale(Locale locale);
	std::vector<std::string> GetSupportedLocaleCodes();
	std::vector<std::wstring> GetSupportedLocaleDisplayNames();
	int GetCurrentLocaleIndex();

	std::string Translate(const std::string& sourceString);
	std::string TranslateWithContext(const std::string& context, const std::string& sourceString);
	std::string TranslatePlural(const std::string& singularSourceString, const std::string& pluralSourceString, int number);
	std::string TranslatePluralWithContext(const std::string& context, const std::string& singularSourceString, const std::string& pluralSourceString, int number);
	std::string TranslateLines(const std::string& sourceString);

	UDate ParseDateTime(const std::string& dateTimeString, const std::string& dateTimeFormat, const Locale& locale);
	std::string LocalizeDateTime(const UDate& dateTime, DateTimeType type, DateFormat::EStyle style);
	std::string FormatMillisecondsIntoDateString(int milliseconds, const std::string& formatString);
	std::string FormatDecimalNumberIntoString(double number);

	VfsPath LocalizePath(VfsPath sourcePath);

private:

	tinygettext::Dictionary* dictionary;
	bool isRtlLanguage;
	Locale currentLocale;
	std::vector<Locale*> availableLocales;
	bool currentLocaleIsOriginalGameLocale;

	Locale GetConfiguredOrSystemLocale();
	void LoadDictionaryForCurrentLocale();
	void LoadListOfAvailableLocales();

	void ReadPoIntoDictionary(const std::string& poContent, tinygettext::Dictionary* dictionary);

	DateFormat* CreateDateTimeInstance(DateTimeType type, DateFormat::EStyle style, const Locale& locale);
};

#endif // L10N_H
