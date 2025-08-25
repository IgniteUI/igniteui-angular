import { ListResourceStringsEN as AListResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IListResourceStrings {
    igx_list_no_items?: string;
    igx_list_loading?: string;
}

export const ListResourceStringsEN: IListResourceStrings = convertToIgxResource(AListResourceStrings);
