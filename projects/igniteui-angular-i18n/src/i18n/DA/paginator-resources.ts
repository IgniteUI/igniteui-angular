import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxPaginator
 */
export const PaginatorResourceStringsDA = {
    igx_paginator_label: 'Elementer per side',
    igx_paginator_pager_text: 'af',
    igx_paginator_first_page_button_text: 'Gå til første side',
    igx_paginator_previous_page_button_text: 'Forrige side',
    igx_paginator_last_page_button_text: 'Gå til sidste side',
    igx_paginator_next_page_button_text: 'Næste side',
} satisfies MakeRequired<IPaginatorResourceStrings>;
