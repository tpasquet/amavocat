import { Constants } from "../global/constant";
import { SupportedLanguages } from "../global/enum";

export function isSupportedLanguage(lang: unknown): lang is SupportedLanguages {
    return typeof lang === 'string' && (Constants.SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}
