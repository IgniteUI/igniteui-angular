import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxList
 */
export const ListResourceStringsDE = {
    igx_list_no_items: 'Es gibt keine Einträge in der Liste.',
    igx_list_loading: 'Lade Daten vom Server...'
} satisfies MakeRequired<IListResourceStrings>;
