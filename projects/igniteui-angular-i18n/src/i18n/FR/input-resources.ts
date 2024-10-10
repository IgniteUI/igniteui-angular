import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxInput
 */
export const InputResourceStringsFR = {
    igx_input_upload_button: 'Charger un fichier',
    igx_input_file_placeholder: 'Aucun fichier sélectionné'
} satisfies MakeRequired<IInputResourceStrings>;
