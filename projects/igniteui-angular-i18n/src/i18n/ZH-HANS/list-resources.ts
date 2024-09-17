import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Simplified Chinese (zh-Hans) resource strings for IgxList
 */
export const ListResourceStringsZHHANS = {
    igx_list_no_items: '列表中没有任何项。',
    igx_list_loading: '正在从服务器加载数据...'
} satisfies MakeRequired<IListResourceStrings>;
