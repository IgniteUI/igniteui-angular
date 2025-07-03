import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxCombo
 */
export const ComboResourceStringsDE = {
    igx_combo_empty_message: 'Die Liste ist leer',
    igx_combo_filter_search_placeholder: 'Suchbegriff eingeben',
    igx_combo_addCustomValues_placeholder: 'Element hinzufügen',
    igx_combo_clearItems_placeholder: 'Auswahl löschen',
    igx_combo_aria_label_options: 'Ausgewählte Optionen',
    igx_combo_aria_label_no_options: 'Keine Optionen ausgewählt'
} satisfies MakeRequired<IComboResourceStrings>;
