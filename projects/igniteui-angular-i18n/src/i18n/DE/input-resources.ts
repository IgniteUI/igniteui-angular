import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxInput
 */
export const InputResourceStringsDE = {
    igx_input_upload_button: 'Datei hochladen',
    igx_input_file_placeholder: 'Keine Datei ausgewählt'
} satisfies MakeRequired<IInputResourceStrings>;
