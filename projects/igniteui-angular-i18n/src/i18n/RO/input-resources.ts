import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxInput
 */
export const InputResourceStringsRO = {
    igx_input_upload_button: 'Încărcare fişier',
    igx_input_file_placeholder: 'Niciun fișier ales'
} satisfies MakeRequired<IInputResourceStrings>;
