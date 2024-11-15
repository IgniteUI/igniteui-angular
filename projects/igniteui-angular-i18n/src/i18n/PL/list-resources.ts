import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxList
 */
export const ListResourceStringsPL = {
    igx_list_no_items: 'Na liście nie ma żadnych elementów.',
    igx_list_loading: 'Ładowanie danych z serwera...'
} satisfies MakeRequired<IListResourceStrings>;
