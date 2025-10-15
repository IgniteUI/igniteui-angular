import {
    type IInputResourceStrings as IAInputResourceStrings,
    type PrefixedResourceStrings,
    InputResourceStringsEN as AInputResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IInputResourceStrings = PrefixedResourceStrings<IAInputResourceStrings, typeof IGX_PREFIX>;

export const InputResourceStringsEN: IInputResourceStrings = prefixResource(IGX_PREFIX, AInputResourceStrings);
