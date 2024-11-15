import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxList
 */
export const ListResourceStringsCS = {
    igx_list_no_items: 'V seznamu nejsou žádné položky.',
    igx_list_loading: 'Načítání dat ze serveru...'
} satisfies MakeRequired<IListResourceStrings>;
