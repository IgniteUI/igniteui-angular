import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxPaginator
 */
export const PaginatorResourceStringsFR = {
    igx_paginator_label: 'Entrées par page',
    igx_paginator_pager_text: 'de',
    igx_paginator_first_page_button_text: 'Aller à la première page',
    igx_paginator_previous_page_button_text: 'Page précédente',
    igx_paginator_last_page_button_text: 'Aller à la dernière page',
    igx_paginator_next_page_button_text: 'Page suivante'
} satisfies MakeRequired<IPaginatorResourceStrings>;
