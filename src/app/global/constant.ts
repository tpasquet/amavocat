import { environment } from "../environments/environment";
import { SupportedLanguages } from "./enum";

export const Constants = {
    SUPPORTED_LANGUAGES: Object.values(SupportedLanguages),
    DEFAULT_LANG: SupportedLanguages.FR,
    LOCAL_STORAGE: {
        LANG_KEY: 'lang'
    },
    HOSTNAME: environment.hostname,
}
