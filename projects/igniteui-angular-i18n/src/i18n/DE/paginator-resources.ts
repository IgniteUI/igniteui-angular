import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxPaginator
 */
export const PaginatorResourceStringsDE = {
    igx_paginator_label: 'Einträge pro Seite',
    igx_paginator_pager_text: 'von',
    igx_paginator_first_page_button_text: 'Gehe zur ersten Seite',
    igx_paginator_previous_page_button_text: 'Vorherige Seite',
    igx_paginator_last_page_button_text: 'Gehe zur letzten Seite',
    igx_paginator_next_page_button_text: 'Nächste Seite'
} satisfies MakeRequired<IPaginatorResourceStrings>;
