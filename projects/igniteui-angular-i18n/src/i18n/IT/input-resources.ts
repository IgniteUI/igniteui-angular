import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxInput
 */
export const InputResourceStringsIT = {
    igx_input_upload_button: 'Carica file',
    igx_input_file_placeholder: 'Nessun file scelto'
} satisfies MakeRequired<IInputResourceStrings>;
