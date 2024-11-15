import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxList
 */
export const ListResourceStringsNL = {
    igx_list_no_items: 'Er zijn geen items in de lijst.',
    igx_list_loading: 'Gegevens van de server laden...'
} satisfies MakeRequired<IListResourceStrings>;
