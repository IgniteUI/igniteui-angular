import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxInput
 */
export const InputResourceStringsTR = {
    igx_input_upload_button: 'Dosya yükle',
    igx_input_file_placeholder: 'Dosya seçilmedi'
} satisfies MakeRequired<IInputResourceStrings>;
