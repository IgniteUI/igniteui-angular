import { ElementRef, OnInit } from "@angular/core";
export declare class IgxHintDirective implements OnInit {
    private _element;
    private _position;
    isPositionStart: boolean;
    isPositionEnd: boolean;
    constructor(_element: ElementRef);
    position: string;
    ngOnInit(): void;
    private _applyPosition(position);
}
