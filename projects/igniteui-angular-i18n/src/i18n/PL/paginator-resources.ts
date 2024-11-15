import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxPaginator
 */
export const PaginatorResourceStringsPL = {
    igx_paginator_label: 'Liczba elementów na stronie',
    igx_paginator_pager_text: 'z',
    igx_paginator_first_page_button_text: 'Przejdź do pierwszej strony',
    igx_paginator_previous_page_button_text: 'Poprzednia strona',
    igx_paginator_last_page_button_text: 'Przejdź do ostatniej strony',
    igx_paginator_next_page_button_text: 'Następna strona',
} satisfies MakeRequired<IPaginatorResourceStrings>;
