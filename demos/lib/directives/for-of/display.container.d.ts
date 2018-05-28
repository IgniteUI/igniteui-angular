import { ChangeDetectorRef, ViewContainerRef } from "@angular/core";
export declare class DisplayContainerComponent {
    cdr: ChangeDetectorRef;
    _viewContainer: ViewContainerRef;
    _vcr: any;
    cssClass: string;
    notVirtual: boolean;
    constructor(cdr: ChangeDetectorRef, _viewContainer: ViewContainerRef);
}
