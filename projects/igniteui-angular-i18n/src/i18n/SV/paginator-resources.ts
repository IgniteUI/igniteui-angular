import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxPaginator
 */
export const PaginatorResourceStringsSV = {
    igx_paginator_label: 'Objekt per sida',
    igx_paginator_pager_text: 'av',
    igx_paginator_first_page_button_text: 'Gå till första sidan',
    igx_paginator_previous_page_button_text: 'Föregående sida',
    igx_paginator_last_page_button_text: 'Gå till sista sidan',
    igx_paginator_next_page_button_text: 'Nästa sida',
} satisfies MakeRequired<IPaginatorResourceStrings>;
