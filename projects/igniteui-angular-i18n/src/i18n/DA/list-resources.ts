import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxList
 */
export const ListResourceStringsDA = {
    igx_list_no_items: 'Der er ingen elementer på listen.',
    igx_list_loading: 'Indlæser data fra serveren...'
} satisfies MakeRequired<IListResourceStrings>;
