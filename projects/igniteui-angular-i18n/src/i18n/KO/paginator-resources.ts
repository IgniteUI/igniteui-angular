import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxPaginator
 */
export const PaginatorResourceStringsKO = {
    igx_paginator_label: '페이지 당 항목',
    igx_paginator_pager_text: '의',
    igx_paginator_first_page_button_text: '첫 페이지로 이동',
    igx_paginator_previous_page_button_text: '이전 페이지',
    igx_paginator_last_page_button_text: '마지막 페이지로 이동',
    igx_paginator_next_page_button_text: '다음 페이지'
} satisfies MakeRequired<IPaginatorResourceStrings>;
