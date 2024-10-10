import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxInput
 */
export const InputResourceStringsPT = {
    igx_input_upload_button: 'Carregar ficheiro',
    igx_input_file_placeholder: 'Nenhum ficheiro selecionado'
} satisfies MakeRequired<IInputResourceStrings>;
