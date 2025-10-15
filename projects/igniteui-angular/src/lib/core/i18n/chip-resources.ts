import {
    type IChipResourceStrings as IAChipResourceStrings,
    type PrefixedResourceStrings,
    ChipResourceStringsEN as AChipResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IChipResourceStrings = PrefixedResourceStrings<IAChipResourceStrings, typeof IGX_PREFIX>;

export const ChipResourceStringsEN: IChipResourceStrings = prefixResource(IGX_PREFIX, AChipResourceStrings);
