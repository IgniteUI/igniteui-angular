import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxCombo
 */
export const ComboResourceStringsES = {
    igx_combo_empty_message: 'La lista está vacía',
    igx_combo_filter_search_placeholder: 'Escriba un término de búsqueda',
    igx_combo_addCustomValues_placeholder: 'Agregar elemento',
    igx_combo_clearItems_placeholder: 'Borrar selección',
    igx_combo_aria_label_options: 'Opciones seleccionadas',
    igx_combo_aria_label_no_options: 'No hay opciones seleccionadas'
} satisfies MakeRequired<IComboResourceStrings>;
