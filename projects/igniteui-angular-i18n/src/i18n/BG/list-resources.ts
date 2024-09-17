import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxList
 */
export const ListResourceStringsBG = {
    igx_list_no_items: 'Няма елементи в списъка.',
    igx_list_loading: 'Зарежда информация от сървъра...'
} satisfies MakeRequired<IListResourceStrings>;
