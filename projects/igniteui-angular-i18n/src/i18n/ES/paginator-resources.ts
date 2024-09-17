import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxPaginator
 */
export const PaginatorResourceStringsES = {
    igx_paginator_label: 'Elementos por página',
    igx_paginator_pager_text: 'de',
    igx_paginator_first_page_button_text: 'Ir a la primera página',
    igx_paginator_previous_page_button_text: 'Página anterior',
    igx_paginator_last_page_button_text: 'Ir a la última página',
    igx_paginator_next_page_button_text: 'Página siguiente'
} satisfies MakeRequired<IPaginatorResourceStrings>;
