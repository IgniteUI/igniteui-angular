import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxList
 */
export const ListResourceStringsHU = {
    igx_list_no_items: 'Nincsenek elemek a listában.',
    igx_list_loading: 'Adatok betöltése a szerverről...'
} satisfies MakeRequired<IListResourceStrings>;
