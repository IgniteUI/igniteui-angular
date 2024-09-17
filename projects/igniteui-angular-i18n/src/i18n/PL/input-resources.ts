import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxInput
 */
export const InputResourceStringsPL = {
    igx_input_upload_button: 'Przekaż plik',
    igx_input_file_placeholder: 'Nie wybrano pliku'
} satisfies MakeRequired<IInputResourceStrings>;
