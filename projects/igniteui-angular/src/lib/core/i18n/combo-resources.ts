import {
    type IComboResourceStrings as IAComboResourceStrings,
    type PrefixedResourceStrings,
    ComboResourceStringsEN as AComboResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IComboResourceStrings = PrefixedResourceStrings<IAComboResourceStrings, typeof IGX_PREFIX>;

export const ComboResourceStringsEN: IComboResourceStrings = prefixResource(IGX_PREFIX, AComboResourceStrings);
