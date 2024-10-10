import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxPaginator
 */
export const PaginatorResourceStringsJA = {
    igx_paginator_label: 'ページごとの項目',
    igx_paginator_pager_text: '/',
    igx_paginator_first_page_button_text: '最初のページに移動',
    igx_paginator_previous_page_button_text: '前のページ',
    igx_paginator_last_page_button_text: '最後のページに移動',
    igx_paginator_next_page_button_text: '次のページ'
} satisfies MakeRequired<IPaginatorResourceStrings>;
