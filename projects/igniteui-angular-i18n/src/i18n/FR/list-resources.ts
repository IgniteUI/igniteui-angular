import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxList
 */
export const ListResourceStringsFR = {
    igx_list_no_items: 'Il n\'y a aucun élément dans la liste.',
    igx_list_loading: 'Chargement des données du serveur...'
} satisfies MakeRequired<IListResourceStrings>;
