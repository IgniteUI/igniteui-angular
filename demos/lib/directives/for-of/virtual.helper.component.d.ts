import { ElementRef, OnInit } from "@angular/core";
export declare class VirtualHelperComponent implements OnInit {
    elementRef: ElementRef;
    _vcr: any;
    itemsLength: number;
    height: number;
    cssClasses: string;
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
}
