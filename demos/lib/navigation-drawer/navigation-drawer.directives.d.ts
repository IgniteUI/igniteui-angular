import { TemplateRef } from "@angular/core";
export declare class IgxNavDrawerItemDirective {
    active: boolean;
    isHeader: boolean;
    readonly activeClass: string;
    readonly defaultCSS: boolean;
    readonly currentCSS: boolean;
    readonly headerCSS: boolean;
}
export declare class IgxNavDrawerTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxNavDrawerMiniTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
