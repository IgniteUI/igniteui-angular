import { ChipResourceStringsEN as AChipResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IChipResourceStrings {
    igx_chip_remove?: string;
    igx_chip_select?: string;
}

export const ChipResourceStringsEN: IChipResourceStrings = convertToIgxResource(AChipResourceStrings);
