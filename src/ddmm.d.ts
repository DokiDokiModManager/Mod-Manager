declare module NodeJS {
    interface Global {
        ddmm_constants: {
            auto_update_disabled: boolean,
            sentry_disabled: boolean,
            discord_disabled: boolean,
            special_cases_disabled: boolean,
            i18n_update_disabled: boolean,
            news_disabled: boolean;
            default_language: string,
            force_bundled_ui: boolean,
            disable_dynamic_about: boolean,
            replace_mod_store: boolean
        }
    }
}
