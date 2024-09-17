import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxInput
 */
export const InputResourceStringsZHHANT = {
    igx_input_upload_button: '上傳檔案',
    igx_input_file_placeholder: '未選擇檔案'
} satisfies MakeRequired<IInputResourceStrings>;
