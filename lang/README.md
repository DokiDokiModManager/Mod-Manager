# Localising DDMM

Thanks for your interest in helping Doki Doki Mod Manager support more languages!

## How to translate

## i18n Manager

If you point [i18n Manager](https://github.com/gilmarsquinelato/i18n-manager/releases) at the `lang` folder, it should work out of the box.

### Translating - the basics

Every currently available language has its own `.json` file. For example, English (UK) is `en-GB.json` and Russian is `ru.json`.
If the language you're looking to translate into doesn't have one, download `en-GB.json`, as that will be your basis for translation.
Rename it to a valid language code from [this list](https://electronjs.org/docs/api/locales).

Once this is done, you can begin translating! If you are familiar with JSON, you should be mostly good to go. If not, read on.

### File Format

Translation files are in the JSON file format. This means they have to be syntactically valid in order for DDMM to be able to understand
them. Here's a small sample from the English (UK) translation file.

```json
{
    "toolbar": {
        "button_get_mods": "Get Mods",
        "button_mod_library": "Mod Library",
        "button_feedback": "Feedback",
        "button_settings": "Settings",
        "button_about": "About",
        "button_debug_crash": "Debug Crash",
        "button_devtools": "DevTools",
        "button_inference": "Inference",
        "button_ui_kit": "UI Kit"
    }
}
 ```
 
The only parts you need to worry about are the key-value pairs - these are the actual translations. You only need to change
the second value in quotes. For example:

```
"button_get_mods": "Get Mods"
```

could go to

```
"button_get_mods": "My translation here"
```  

Don't change the translation key (in this case `button_get_mods`) as this may cause problems.

In some cases you may need to put double quotes in your translated text. If this is the case, they must be "escaped" with a backslash.

```
"some_translation": "My \"translation\" here"
```

### Placeholder values

You may notice that some strings have numbers in curly brackets like this: `{0}` - these are placeholders. Here's an example:

```
"message_progress": "Downloading {0} - {1}% complete"
```

In this case, the first placeholder (`{0}`) represents a file that is being downloaded, and the second (`{1}`) represents the
percentage downloaded.

### Guidelines

1. If you're creating a new language file, make sure you use a language code from [here](https://electronjs.org/docs/api/locales). 
Anything else will be rejected.
2. Use [English (UK)](en-GB.json) as the basis for your translations.
3. Please don't use a machine translator to create translations. Native speakers are preferred.
4. If possible, avoid making your strings significantly longer or shorter than the original English.
