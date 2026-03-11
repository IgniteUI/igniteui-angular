import {
    type IActionStripResourceStrings as IAActionStripResourceStrings,
    type PrefixedResourceStrings,
    ActionStripResourceStringsEN as AActionStripResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IActionStripResourceStrings = PrefixedResourceStrings<IAActionStripResourceStrings, typeof IGX_PREFIX>;

export const ActionStripResourceStringsEN: IActionStripResourceStrings = prefixResource(IGX_PREFIX, AActionStripResourceStrings);
