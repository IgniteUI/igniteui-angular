import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxList
 */
export const ListResourceStringsPT = {
    igx_list_no_items: 'Não há itens na lista.',
    igx_list_loading: 'A carregar dados do servidor...'
} satisfies MakeRequired<IListResourceStrings>;
