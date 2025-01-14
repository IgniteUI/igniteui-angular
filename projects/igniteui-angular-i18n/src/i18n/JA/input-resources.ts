import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxInput
 */
export const InputResourceStringsJA = {
    igx_input_upload_button: 'ファイルのアップロード',
    igx_input_file_placeholder: 'ファイルが指定されていません'
} satisfies MakeRequired<IInputResourceStrings>;
