import { IListResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxList
 */
export const ListResourceStringsES = {
    igx_list_no_items: 'No hay elementos en la lista.',
    igx_list_loading: 'Cargando datos desde el servidor…'
} satisfies MakeRequired<IListResourceStrings>;
