import { TreeResourceStringsEN as ATreeResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface ITreeResourceStrings {
    igx_expand?: string;
    igx_collapse?: string;
}

export const TreeResourceStringsEN: ITreeResourceStrings = convertToIgxResource(ATreeResourceStrings);
