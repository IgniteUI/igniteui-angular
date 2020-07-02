import { Injectable } from '@angular/core';
import { IgxIconService } from '../../icon/icon.service';
import { GridIconsFeature } from './enums';
import { GridSVGIcon } from './grid.interface';

/**
 * @hidden
 */
@Injectable()
export class IgxGridIconService {

    private iconsMap = new Map<GridIconsFeature, GridSVGIcon[]>();
    private fontSetMap = new Map<GridIconsFeature, string>();
    private registeredIcons = new Map<GridIconsFeature, boolean>();

    constructor(private iconService: IgxIconService) { }

    /**
     * Register filtering SVG icons in the icon service.
     */
    public registerSVGIcons(feature: GridIconsFeature, icons: GridSVGIcon[], fontSet: string): void {
        if (!this.registeredIcons.has(feature) || !this.registeredIcons.get(feature)) {
            for (const icon of icons) {
                if (!this.iconService.isSvgIconCached(icon.name, fontSet)) {
                    this.iconService.addSvgIconFromText(icon.name, icon.value, fontSet);
                }
            }
            this.iconsMap.set(feature, icons);
            this.fontSetMap.set(feature, fontSet);
            this.registeredIcons.set(feature, true);
        }
    }
}
