import { Constants } from "../global/constant";

export function isSupportedLanguage(lang: string) {
    return Constants.SUPPORTED_LANGUAGES.includes(lang);
}