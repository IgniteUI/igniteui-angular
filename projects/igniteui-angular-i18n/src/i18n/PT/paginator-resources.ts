import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxPaginator
 */
export const PaginatorResourceStringsPT = {
    igx_paginator_label: 'Itens por página',
    igx_paginator_pager_text: 'de',
    igx_paginator_first_page_button_text: 'Ir para a primeira página',
    igx_paginator_previous_page_button_text: 'Página anterior',
    igx_paginator_last_page_button_text: 'Ir para a última página',
    igx_paginator_next_page_button_text: 'Página seguinte',
} satisfies MakeRequired<IPaginatorResourceStrings>;
