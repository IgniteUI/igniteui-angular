import { ElementRef, OnInit, TemplateRef } from "@angular/core";
import { IgxIconService } from "./icon.service";
export declare class IgxIconComponent implements OnInit {
    el: ElementRef;
    private iconService;
    private noLigature;
    private implicitLigature;
    private explicitLigature;
    cssClass: string;
    ariaHidden: boolean;
    id: string;
    font: string;
    active: boolean;
    iconColor: string;
    iconName: string;
    glyphName: string;
    constructor(el: ElementRef, iconService: IgxIconService);
    ngOnInit(): void;
    readonly getFontSet: string;
    readonly getActive: boolean;
    readonly getInactive: boolean;
    readonly getIconColor: string;
    readonly getIconName: string;
    readonly template: TemplateRef<HTMLElement>;
    private checkInputProps();
    private updateIconClass();
}
