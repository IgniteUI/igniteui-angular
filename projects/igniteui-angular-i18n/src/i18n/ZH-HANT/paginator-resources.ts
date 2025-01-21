import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxPaginator
 */
export const PaginatorResourceStringsZHHANT = {
    igx_paginator_label: '每頁項目',
    igx_paginator_pager_text: '/',
    igx_paginator_first_page_button_text: '前往首頁',
    igx_paginator_previous_page_button_text: '上一頁',
    igx_paginator_last_page_button_text: '轉到最後一頁',
    igx_paginator_next_page_button_text: '下一頁'
} satisfies MakeRequired<IPaginatorResourceStrings>;
