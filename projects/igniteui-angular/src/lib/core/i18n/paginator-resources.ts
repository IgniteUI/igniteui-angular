import { PaginatorResourceStringsEN as APaginatorResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IPaginatorResourceStrings {
    igx_paginator_label?: string;
    igx_paginator_pager_text?: string;
    igx_paginator_first_page_button_text?: string;
    igx_paginator_previous_page_button_text?: string;
    igx_paginator_last_page_button_text?: string;
    igx_paginator_next_page_button_text?: string;
}

export const PaginatorResourceStringsEN: IPaginatorResourceStrings = convertToIgxResource(APaginatorResourceStrings);
