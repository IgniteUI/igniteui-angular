import { IPaginatorResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxPaginator
 */
export const PaginatorResourceStringsBG = {
    igx_paginator_label: 'Елементи на страница',
    igx_paginator_pager_text: 'от',
    igx_paginator_first_page_button_text: 'Към първата страница',
    igx_paginator_previous_page_button_text: 'Предишна страница',
    igx_paginator_last_page_button_text: 'Към последната страница',
    igx_paginator_next_page_button_text: 'Следваща страница',
} satisfies MakeRequired<IPaginatorResourceStrings>;
