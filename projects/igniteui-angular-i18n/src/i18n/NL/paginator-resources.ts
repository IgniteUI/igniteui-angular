import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxPaginator
 */
export const PaginatorResourceStringsNL = {
    igx_paginator_label: 'Items per pagina',
    igx_paginator_pager_text: 'van',
    igx_paginator_first_page_button_text: 'Ga naar de eerste pagina',
    igx_paginator_previous_page_button_text: 'Vorige pagina',
    igx_paginator_last_page_button_text: 'Ga naar de laatste pagina',
    igx_paginator_next_page_button_text: 'Volgende pagina',
} satisfies MakeRequired<IPaginatorResourceStrings>;
