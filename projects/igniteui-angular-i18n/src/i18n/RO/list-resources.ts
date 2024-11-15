import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxList
 */
export const ListResourceStringsRO = {
    igx_list_no_items: 'Nu există articole în listă.',
    igx_list_loading: 'Se încarcă datele de pe server...'
} satisfies MakeRequired<IListResourceStrings>;
