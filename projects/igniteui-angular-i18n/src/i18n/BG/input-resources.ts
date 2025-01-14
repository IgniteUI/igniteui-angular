import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxInput
 */
export const InputResourceStringsBG = {
    igx_input_upload_button: 'Качване на файл',
    igx_input_file_placeholder: 'Няма избран файл'
} satisfies MakeRequired<IInputResourceStrings>;
