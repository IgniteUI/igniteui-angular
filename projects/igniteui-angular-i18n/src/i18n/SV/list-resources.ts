import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxList
 */
export const ListResourceStringsSV = {
    igx_list_no_items: 'Det finns inga objekt i listan.',
    igx_list_loading: 'Laddar data från servern...'
} satisfies MakeRequired<IListResourceStrings>;
