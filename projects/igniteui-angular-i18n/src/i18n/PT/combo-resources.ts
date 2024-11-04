import { IComboResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxCombo
 */
export const ComboResourceStringsPT = {
    igx_combo_empty_message: 'A lista está vazia',
    igx_combo_filter_search_placeholder: 'Digite um termo de pesquisa',
    igx_combo_addCustomValues_placeholder: 'Adicionar item',
    igx_combo_clearItems_placeholder: 'Limpar seleção'
} satisfies MakeRequired<IComboResourceStrings>;
