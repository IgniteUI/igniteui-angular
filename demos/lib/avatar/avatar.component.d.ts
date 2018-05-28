import { AfterViewInit, ElementRef, OnInit, TemplateRef } from "@angular/core";
export declare enum Size {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
}
export declare class IgxAvatarComponent implements OnInit, AfterViewInit {
    elementRef: ElementRef;
    image: ElementRef;
    protected imageTemplate: TemplateRef<any>;
    protected initialsTemplate: TemplateRef<any>;
    protected iconTemplate: TemplateRef<any>;
    ariaLabel: string;
    role: string;
    cssClass: string;
    roleDescription: string;
    private _size;
    id: string;
    roundShape: boolean;
    color: string;
    bgColor: string;
    initials: string;
    icon: string;
    src: string;
    size: string | Size;
    readonly template: TemplateRef<any>;
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    private getRole();
}
export declare class IgxAvatarModule {
}
