import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxCombo
 */
export const ComboResourceStringsFR = {
    igx_combo_empty_message: 'La liste est vide',
    igx_combo_filter_search_placeholder: 'Entrez un terme de recherche',
    igx_combo_addCustomValues_placeholder: 'Ajouter un élément',
    igx_combo_clearItems_placeholder: 'Effacer la sélection'
} satisfies MakeRequired<IComboResourceStrings>;
