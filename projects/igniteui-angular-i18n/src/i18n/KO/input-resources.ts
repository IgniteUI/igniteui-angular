import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxInput
 */
export const InputResourceStringsKO = {
    igx_input_upload_button: '파일 업로드',
    igx_input_file_placeholder: '파일이 선택되지 않음'
} satisfies MakeRequired<IInputResourceStrings>;
