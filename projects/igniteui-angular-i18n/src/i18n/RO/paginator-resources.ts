import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxPaginator
 */
export const PaginatorResourceStringsRO = {
    igx_paginator_label: 'Articole pe pagină',
    igx_paginator_pager_text: 'de',
    igx_paginator_first_page_button_text: 'Accesați prima pagină',
    igx_paginator_previous_page_button_text: 'Pagina precedentă',
    igx_paginator_last_page_button_text: 'Accesați ultima pagină',
    igx_paginator_next_page_button_text: 'Pagina următoare',
} satisfies MakeRequired<IPaginatorResourceStrings>;
