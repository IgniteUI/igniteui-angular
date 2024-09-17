import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxList
 */
export const ListResourceStringsTR = {
    igx_list_no_items: 'Listede hiç öğe yok.',
    igx_list_loading: 'Sunucudan veri yükleniyor...'
} satisfies MakeRequired<IListResourceStrings>;
