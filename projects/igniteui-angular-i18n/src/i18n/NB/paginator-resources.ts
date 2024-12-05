import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxPaginator
 */
export const PaginatorResourceStringsNB = {
    igx_paginator_label: 'Elementer per side',
    igx_paginator_pager_text: 'av',
    igx_paginator_first_page_button_text: 'Gå til første side',
    igx_paginator_previous_page_button_text: 'Forrige side',
    igx_paginator_last_page_button_text: 'Gå til siste side',
    igx_paginator_next_page_button_text: 'Neste side'
} satisfies MakeRequired<IPaginatorResourceStrings>;
