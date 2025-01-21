import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxInput
 */
export const InputResourceStringsNL = {
    igx_input_upload_button: 'Bestand uploaden',
    igx_input_file_placeholder: 'Geen bestand gekozen'
} satisfies MakeRequired<IInputResourceStrings>;
