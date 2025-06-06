import { GridResourceStringsEN, IGridResourceStrings } from 'igniteui-angular/src/lib/core/i18n/grid-resources';
import { CalendarResourceStringsBG, GridResourceStringsBG, GridResourceStringsCS, GridResourceStringsDA, GridResourceStringsDE, GridResourceStringsES, GridResourceStringsFR, GridResourceStringsHU, GridResourceStringsIT, GridResourceStringsJA, GridResourceStringsKO, GridResourceStringsNB, GridResourceStringsNL, GridResourceStringsPL, GridResourceStringsPT, GridResourceStringsRO, GridResourceStringsSV, GridResourceStringsTR, GridResourceStringsZHHANS, GridResourceStringsZHHANT, IgxResourceStringsBG, IgxResourceStringsCS, IgxResourceStringsDA, IgxResourceStringsDE, IgxResourceStringsES, IgxResourceStringsFR, IgxResourceStringsHU, IgxResourceStringsIT, IgxResourceStringsJA, IgxResourceStringsKO, IgxResourceStringsNB, IgxResourceStringsNL, IgxResourceStringsPL, IgxResourceStringsRO, IgxResourceStringsSV, IgxResourceStringsTR, IgxResourceStringsZHHANS, IgxResourceStringsZHHANT, PaginatorResourceStringsBG, PaginatorResourceStringsCS, PaginatorResourceStringsDA, PaginatorResourceStringsDE, PaginatorResourceStringsES, PaginatorResourceStringsFR, PaginatorResourceStringsHU, PaginatorResourceStringsIT, PaginatorResourceStringsJA, PaginatorResourceStringsKO, PaginatorResourceStringsNB, PaginatorResourceStringsNL, PaginatorResourceStringsPL, PaginatorResourceStringsPT, PaginatorResourceStringsRO, PaginatorResourceStringsSV, PaginatorResourceStringsTR, PaginatorResourceStringsZHHANS, PaginatorResourceStringsZHHANT } from 'igniteui-angular-i18n';
import { changei18n, ICalendarResourceStrings, IPaginatorResourceStrings, IResourceStrings, PaginatorResourceStringsEN } from 'igniteui-angular';
import { registerLocaleData } from '@angular/common';

export enum GridLocalizationStrings {
    EN = "en",
    BG = "bg",
    CS = "cs",
    DA = "da",
    DE = "de",
    ES = "es",
    FR = "fr",
    HU = "hu",
    IT = "it",
    JA = "ja",
    KO = "ko",
    NB = "nb",
    NL = "nl",
    PL = "pl",
    PT = "pt",
    RO = "ro",
    SV = "sv",
    TR = "tr",
    ZHHANS = "zh-hans",
    ZHHANT = "zh-hant"
}

export enum GridLocalizedComponents {
    Grid = "grid",
    TreeGrid = "tree-grid",
    PivotGrid = "pivot-grid",
    HierarchicalGrid = "hierarchical-grid",
    Paginator = "paginator"
}

const GridLocalizationMap = new Map<string, IGridResourceStrings>([
    [ GridLocalizationStrings.EN, GridResourceStringsEN ],
    [ GridLocalizationStrings.BG, GridResourceStringsBG ],
    [ GridLocalizationStrings.CS, GridResourceStringsCS ],
    [ GridLocalizationStrings.DA, GridResourceStringsDA ],
    [ GridLocalizationStrings.DE, GridResourceStringsDE ],
    [ GridLocalizationStrings.ES, GridResourceStringsES ],
    [ GridLocalizationStrings.FR, GridResourceStringsFR ],
    [ GridLocalizationStrings.HU, GridResourceStringsHU ],
    [ GridLocalizationStrings.IT, GridResourceStringsIT ],
    [ GridLocalizationStrings.JA, GridResourceStringsJA ],
    [ GridLocalizationStrings.KO, GridResourceStringsKO ],
    [ GridLocalizationStrings.NB, GridResourceStringsNB ],
    [ GridLocalizationStrings.NL, GridResourceStringsNL ],
    [ GridLocalizationStrings.PL, GridResourceStringsPL ],
    [ GridLocalizationStrings.PT, GridResourceStringsPT ],
    [ GridLocalizationStrings.RO, GridResourceStringsRO ],
    [ GridLocalizationStrings.SV, GridResourceStringsSV ],
    [ GridLocalizationStrings.TR, GridResourceStringsTR ],
    [ GridLocalizationStrings.ZHHANS, GridResourceStringsZHHANS ],
    [ GridLocalizationStrings.ZHHANT, GridResourceStringsZHHANT ]
]);

const PaginatorLocalizationMap = new Map<string, IPaginatorResourceStrings>([
    [ GridLocalizationStrings.EN, PaginatorResourceStringsEN ],
    [ GridLocalizationStrings.BG, PaginatorResourceStringsBG ],
    [ GridLocalizationStrings.CS, PaginatorResourceStringsCS ],
    [ GridLocalizationStrings.DA, PaginatorResourceStringsDA ],
    [ GridLocalizationStrings.DE, PaginatorResourceStringsDE ],
    [ GridLocalizationStrings.ES, PaginatorResourceStringsES ],
    [ GridLocalizationStrings.FR, PaginatorResourceStringsFR ],
    [ GridLocalizationStrings.HU, PaginatorResourceStringsHU ],
    [ GridLocalizationStrings.IT, PaginatorResourceStringsIT ],
    [ GridLocalizationStrings.JA, PaginatorResourceStringsJA ],
    [ GridLocalizationStrings.KO, PaginatorResourceStringsKO ],
    [ GridLocalizationStrings.NB, PaginatorResourceStringsNB ],
    [ GridLocalizationStrings.NL, PaginatorResourceStringsNL ],
    [ GridLocalizationStrings.PL, PaginatorResourceStringsPL ],
    [ GridLocalizationStrings.PT, PaginatorResourceStringsPT ],
    [ GridLocalizationStrings.RO, PaginatorResourceStringsRO ],
    [ GridLocalizationStrings.SV, PaginatorResourceStringsSV ],
    [ GridLocalizationStrings.TR, PaginatorResourceStringsTR ],
    [ GridLocalizationStrings.ZHHANS, PaginatorResourceStringsZHHANS ],
    [ GridLocalizationStrings.ZHHANT, PaginatorResourceStringsZHHANT ]
]);

export const GridLocalizationConfig = new Map<string, Map<string, IGridResourceStrings | IPaginatorResourceStrings>>([
    [ GridLocalizedComponents.Grid, GridLocalizationMap],
    [ GridLocalizedComponents.TreeGrid, GridLocalizationMap],
    [ GridLocalizedComponents.PivotGrid, GridLocalizationMap],
    [ GridLocalizedComponents.HierarchicalGrid, GridLocalizationMap],
    [ GridLocalizedComponents.Paginator, PaginatorLocalizationMap]
]);

export const LocalizationConfig = new Map<string, any>([
    [ GridLocalizationStrings.BG, IgxResourceStringsBG ],
    [ GridLocalizationStrings.CS, IgxResourceStringsCS ],
    [ GridLocalizationStrings.DA, IgxResourceStringsDA ],
    [ GridLocalizationStrings.DE, IgxResourceStringsDE ],
    [ GridLocalizationStrings.ES, IgxResourceStringsES ],
    [ GridLocalizationStrings.FR, IgxResourceStringsFR ],
    [ GridLocalizationStrings.HU, IgxResourceStringsHU ],
    [ GridLocalizationStrings.IT, IgxResourceStringsIT ],
    [ GridLocalizationStrings.JA, IgxResourceStringsJA ],
    [ GridLocalizationStrings.KO, IgxResourceStringsKO ],
    [ GridLocalizationStrings.NB, IgxResourceStringsNB ],
    [ GridLocalizationStrings.NL, IgxResourceStringsNL ],
    [ GridLocalizationStrings.PL, IgxResourceStringsPL ],
    [ GridLocalizationStrings.PT, IgxResourceStringsFR ],
    [ GridLocalizationStrings.RO, IgxResourceStringsRO ],
    [ GridLocalizationStrings.SV, IgxResourceStringsSV ],
    [ GridLocalizationStrings.TR, IgxResourceStringsTR ],
    [ GridLocalizationStrings.ZHHANS, IgxResourceStringsZHHANS ],
    [ GridLocalizationStrings.ZHHANT, IgxResourceStringsZHHANT ]
]);

/**
 * Adds custom resource strings for a specified language.
 * @param language The name of the language that should match the `lang` attribute of the page.
 * @param component The name of the component that should the resource strings be added. See `GridLocalizedComponents` enum for supported components.
 * @param resourceStrings The resource strings to be added.
 */
export function addGridResourceStrings(language: string, component: GridLocalizedComponents, resourceStrings: any) {
    GridLocalizationConfig.get(component).set(language, resourceStrings);
}

export function registerGridLocale(data: any) {
    registerLocaleData(data);
}

export function changeGridsI18n(resourceStrings: any) {
    const normalizedResourceStrings: IResourceStrings = {};
    for (const key of Object.keys(resourceStrings)) {
        let stringKey = key;
        if (!stringKey.startsWith("igx_")) {
            stringKey = "igx_" + stringKey;
        }
        normalizedResourceStrings[stringKey] = resourceStrings[key];
    }
    changei18n(normalizedResourceStrings);
}

export function createGenericLocaleObject(resourceStrings: any) {
    const genericResourceStrings = {};
    for (const key of Object.keys(resourceStrings)) {
        let stringKey = key;
        if (stringKey.startsWith("igx_")) {
            stringKey = stringKey.replace("igx_", "");
        }
        genericResourceStrings[stringKey] = resourceStrings[key];
    }
    return genericResourceStrings;
}
