import { InputResourceStringsEN as AInputResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IInputResourceStrings {
    igx_input_upload_button?: string;
    igx_input_file_placeholder?: string;
}

export const InputResourceStringsEN: IInputResourceStrings = convertToIgxResource(AInputResourceStrings);
