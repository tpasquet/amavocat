import { SupportedLanguages } from "./enum";
import { PageMeta } from "./interfaces";

export type PageMetaTranslations = {
    [key in SupportedLanguages]: PageMeta;
};