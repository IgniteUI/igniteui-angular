import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxList
 */
export const ListResourceStringsIT = {
    igx_list_no_items: 'Non ci sono elementi nell\'elenco.',
    igx_list_loading: 'Caricamento dati dal server in corso...'
} satisfies MakeRequired<IListResourceStrings>;
