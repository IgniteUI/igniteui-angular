import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxList
 */
export const ListResourceStringsNB = {
    igx_list_no_items: 'Det er ingen elementer på listen.',
    igx_list_loading: 'Laster inn data fra serveren...'
} satisfies MakeRequired<IListResourceStrings>;
