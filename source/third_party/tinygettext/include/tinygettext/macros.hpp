
#ifndef HEADER_TINYGETTEXT_MACROS_HPP
#define HEADER_TINYGETTEXT_MACROS_HPP

#ifdef _MSC_VER
#  ifdef tinygettext_EXPORTS
#    define tinygettext_API __declspec( dllexport )
#  else
#    define tinygettext_API __declspec( dllimport )
#  endif
#else
#  define tinygettext_API
#endif

#endif // HEADER_TINYGETTEXT_MACROS_HPP
