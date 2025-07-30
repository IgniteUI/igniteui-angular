import { BannerResourceStringsEN as ABannerResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface IBannerResourceStrings {
    igx_banner_button_dismiss?: string;
}

export const BannerResourceStringsEN: IBannerResourceStrings = convertToIgxResource(ABannerResourceStrings);
