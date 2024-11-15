
import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxPaginator
 */
export const PaginatorResourceStringsCS = {
    igx_paginator_label: 'Položek na stráncee',
    igx_paginator_pager_text: 'z',
    igx_paginator_first_page_button_text: 'Přejít na první stránku',
    igx_paginator_previous_page_button_text: 'Předchozí stránka',
    igx_paginator_last_page_button_text: 'Přejít na poslední stránku',
    igx_paginator_next_page_button_text: 'Další strana',
} satisfies MakeRequired<IPaginatorResourceStrings>;
