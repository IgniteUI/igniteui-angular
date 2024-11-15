import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxList
 */
export const ListResourceStringsKO = {
    igx_list_no_items: '목록에 항목이 없습니다.',
    igx_list_loading: '서버에서 데이터를로드하는 중...'
} satisfies MakeRequired<IListResourceStrings>;
