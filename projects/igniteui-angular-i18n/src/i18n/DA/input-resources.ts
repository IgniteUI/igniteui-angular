import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Danish resource strings for IgxInput
 */
export const InputResourceStringsDA = {
    igx_input_upload_button: 'Upload fil',
    igx_input_file_placeholder: 'Der er ikke valgt nogen fil'
} satisfies MakeRequired<IInputResourceStrings>;
