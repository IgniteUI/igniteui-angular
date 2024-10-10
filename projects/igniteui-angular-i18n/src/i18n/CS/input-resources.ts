import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxInput
 */
export const InputResourceStringsCS = {
    igx_input_upload_button: 'Nahrát soubor',
    igx_input_file_placeholder: 'Není zvolený žádný soubor'
} satisfies MakeRequired<IInputResourceStrings>;
