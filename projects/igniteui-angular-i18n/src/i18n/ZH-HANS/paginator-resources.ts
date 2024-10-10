import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Simplified Chinese (zh-Hans) resource strings for IgxPaginator
 */
export const PaginatorResourceStringsZHHANS = {
    igx_paginator_label: '每页的项数',
    igx_paginator_pager_text: '/',
    igx_paginator_first_page_button_text: '转到第一页',
    igx_paginator_previous_page_button_text: '上一页',
    igx_paginator_last_page_button_text: '转到最后一页',
    igx_paginator_next_page_button_text: '下一页'
} satisfies MakeRequired<IPaginatorResourceStrings>;
