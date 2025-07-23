import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxCombo
 */
export const ComboResourceStringsIT = {
    igx_combo_empty_message: 'L\'elenco è vuoto',
    igx_combo_filter_search_placeholder: 'Immettere il testo di ricerca',
    igx_combo_addCustomValues_placeholder: 'Aggiungi elemento',
    igx_combo_clearItems_placeholder: 'Cancella selezione',
    igx_combo_aria_label_options: 'Opzioni selezionate',
    igx_combo_aria_label_no_options: 'Nessuna opzione selezionata'
} satisfies MakeRequired<IComboResourceStrings>;
