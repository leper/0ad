var g_translations = [];
var g_pluralTranslations = {};
var g_translationsWithContext = {};
var g_pluralTranslationsWithContext = {};


// Translates the specified English message into the current language.
//
// This function relies on the g_translations cache when possible. You should use this function instead of
// Engine.Translate() whenever you can to minimize the number of C++ calls and string conversions involved.
function translate(message)
{
	var translation = g_translations[message];
	if (!translation)
		return g_translations[message] = Engine.Translate(message);
	return translation;
}


// Translates the specified English message into the current language for the specified number.
//
// This function relies on the g_pluralTranslations cache when possible. You should use this function instead of
// Engine.TranslatePlural() whenever you can to minimize the number of C++ calls and string conversions involved.
function translatePlural(singularMessage, pluralMessage, number)
{
	var translation = g_pluralTranslations[singularMessage];
	if (!translation)
		g_pluralTranslations[singularMessage] = {};

	var pluralTranslation = g_pluralTranslations[singularMessage][number];
	if (!pluralTranslation)
		return g_pluralTranslations[singularMessage][number] = Engine.TranslatePlural(singularMessage, pluralMessage, number);

	return pluralTranslation;
}


// Translates the specified English message into the current language for the specified context.
//
// This function relies on the g_translationsWithContext cache when possible. You should use this function instead of
// Engine.TranslateWithContext() whenever you can to minimize the number of C++ calls and string conversions involved.
function translateWithContext(context, message)
{
	var translationContext = g_translationsWithContext[context];
	if (!translationContext)
		g_translationsWithContext[context] = {}

	var translationWithContext = g_translationsWithContext[context][message];
	if (!translationWithContext)
		return g_translationsWithContext[context][message] = Engine.TranslateWithContext(context, message);

	return translationWithContext;
}


// Translates the specified English message into the current language for the specified context and number.
//
// This function relies on the g_pluralTranslationsWithContext cache when possible. You should use this function instead of
// Engine.TranslatePluralWithContext() whenever you can to minimize the number of C++ calls and string conversions involved.
function translatePluralWithContext(context, singularMessage, pluralMessage, number)
{
	var translationContext = g_pluralTranslationsWithContext[context];
	if (!translationContext)
		g_pluralTranslationsWithContext[context] = {};

	var translationWithContext = g_pluralTranslationsWithContext[context][singularMessage];
	if (!translationWithContext)
		g_pluralTranslationsWithContext[context][singularMessage] = {};

	var pluralTranslationWithContext = g_pluralTranslationsWithContext[context][singularMessage][number];
	if (!pluralTranslationWithContext)
		return g_pluralTranslationsWithContext[context][singularMessage][number] = Engine.TranslatePluralWithContext(context, singularMessage, pluralMessage, number);

	return pluralTranslationWithContext;
}


// Translates any string value in the specified JavaScript object that is associated with a key included in
// the specified keys array.
function translateObjectKeys(object, keys) {
	for (var property in object)
	{
		if (keys.indexOf(property) > -1)
		{
			if (object[property] != "" && object[property] !== undefined)
			{
				object[property] = translate(object[property]);
			}
		}
		else
		{
			// From http://stackoverflow.com/a/7390612/939364
			var variableType = ({}).toString.call(object[property]).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
			if (variableType === "object" || variableType == "array")
			{
				translateObjectKeys(object[property], keys);
			}
		}
	}
}
