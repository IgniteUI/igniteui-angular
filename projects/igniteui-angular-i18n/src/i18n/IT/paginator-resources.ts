import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxPaginator
 */
export const PaginatorResourceStringsIT = {
    igx_paginator_label: 'Elementi per pagina',
    igx_paginator_pager_text: 'di',
    igx_paginator_first_page_button_text: 'Vai alla prima pagina',
    igx_paginator_previous_page_button_text: 'Pagina precedente',
    igx_paginator_last_page_button_text: 'Vai all\'ultima pagina',
    igx_paginator_next_page_button_text: 'Pagina successiva'
} satisfies MakeRequired<IPaginatorResourceStrings>;
