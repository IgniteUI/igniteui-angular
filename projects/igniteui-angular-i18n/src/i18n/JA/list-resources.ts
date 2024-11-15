import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxList
 */
export const ListResourceStringsJA = {
    igx_list_no_items: 'リストに項目がありません。',
    igx_list_loading: 'サーバーからデータを読み込んでいます。'
} satisfies MakeRequired<IListResourceStrings>;
