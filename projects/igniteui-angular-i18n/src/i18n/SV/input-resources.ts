import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxInput
 */
export const InputResourceStringsSV = {
    igx_input_upload_button: 'Ladda upp fil',
    igx_input_file_placeholder: 'Ingen fil har valts'
} satisfies MakeRequired<IInputResourceStrings>;
