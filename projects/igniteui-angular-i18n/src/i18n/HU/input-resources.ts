import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxInput
 */
export const InputResourceStringsHU = {
    igx_input_upload_button: 'Fájl feltöltése',
    igx_input_file_placeholder: 'Nincs fájl kiválasztva'
} satisfies MakeRequired<IInputResourceStrings>;
