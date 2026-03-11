import {
    type ITreeResourceStrings as IATreeResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    TreeResourceStringsEN as ATreeResourceStrings,
    prefixResource
} from 'igniteui-i18n-core';

export type ITreeResourceStrings = PrefixedResourceStrings<IATreeResourceStrings, typeof IGX_PREFIX>;

export const TreeResourceStringsEN: ITreeResourceStrings = prefixResource(IGX_PREFIX, ATreeResourceStrings);
