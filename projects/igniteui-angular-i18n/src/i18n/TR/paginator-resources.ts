import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxPaginator
 */
export const PaginatorResourceStringsTR = {
    igx_paginator_label: 'Sayfa başına öğeler',
    igx_paginator_pager_text: '/',
    igx_paginator_first_page_button_text: 'İlk sayfaya git',
    igx_paginator_previous_page_button_text: 'Önceki sayfa',
    igx_paginator_last_page_button_text: 'Son sayfaya git',
    igx_paginator_next_page_button_text: 'Sonraki Sayfa',
} satisfies MakeRequired<IPaginatorResourceStrings>;
