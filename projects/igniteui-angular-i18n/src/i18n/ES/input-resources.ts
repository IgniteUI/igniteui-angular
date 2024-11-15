import { IInputResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxInput
 */
export const InputResourceStringsES = {
    igx_input_upload_button: 'Cargar archivo',
    igx_input_file_placeholder: 'No hay ningún archivo seleccionado'
} satisfies MakeRequired<IInputResourceStrings>;
