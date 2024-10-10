import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxPaginator
 */
export const PaginatorResourceStringsHU = {
    igx_paginator_label: 'Elemek száma oldalanként',
    igx_paginator_pager_text: '/',
    igx_paginator_first_page_button_text: 'Ugrás az első oldalra',
    igx_paginator_previous_page_button_text: 'Előző oldal',
    igx_paginator_last_page_button_text: 'Ugrás az utolsó oldalra',
    igx_paginator_next_page_button_text: 'Következő oldal',
} satisfies MakeRequired<IPaginatorResourceStrings>;
