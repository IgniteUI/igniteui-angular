import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxInput
 */
export const InputResourceStringsNB = {
    igx_input_upload_button: 'Last opp fil',
    igx_input_file_placeholder: 'Det er ikke valgt noen fil'
} satisfies MakeRequired<IInputResourceStrings>;
