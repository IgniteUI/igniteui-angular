import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxList
 */
export const ListResourceStringsZHHANT = {
    igx_list_no_items: '清單中沒有任何項目。',
    igx_list_loading: '正在從伺服器載入資料...'
} satisfies MakeRequired<IListResourceStrings>;
