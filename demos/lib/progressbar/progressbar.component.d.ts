import { AfterViewInit, ElementRef, EventEmitter, Renderer2 } from "@angular/core";
export declare enum IgxTextAlign {
    START = "start",
    CENTER = "center",
    END = "end",
}
export interface IChangeProgressEventArgs {
    previousValue: number;
    currentValue: number;
}
export declare abstract class BaseProgress {
    protected requestAnimationId: number;
    protected _valueInPercent: number;
    protected _max: number;
    protected _value: number;
    protected _animate: boolean;
    valueInPercent: number;
    protected runAnimation(val: number): void;
    protected updateProgressSmoothly(val: number, direction: number): void;
    protected updateProgressDirectly(val: number): void;
    protected directionFlow(currentValue: number, prevValue: number): number;
}
export declare class IgxLinearProgressBarComponent extends BaseProgress {
    private elementRef;
    id: string;
    textAlign: IgxTextAlign;
    textVisibility: boolean;
    textTop: boolean;
    text: string;
    striped: boolean;
    type: string;
    animate: boolean;
    max: number;
    value: number;
    onProgressChanged: EventEmitter<IChangeProgressEventArgs>;
    constructor(elementRef: ElementRef);
}
export declare class IgxCircularProgressBarComponent extends BaseProgress implements AfterViewInit {
    private elementRef;
    private renderer;
    private readonly STROKE_OPACITY_DVIDER;
    private readonly STROKE_OPACITY_ADDITION;
    onProgressChanged: EventEmitter<IChangeProgressEventArgs>;
    id: string;
    textVisibility: boolean;
    animate: boolean;
    max: number;
    value: number;
    private _radius;
    private _circumference;
    private _svgCircle;
    private _svgText;
    constructor(elementRef: ElementRef, renderer: Renderer2);
    ngAfterViewInit(): void;
    updateProgressSmoothly(val: number, direction: number): void;
    updateProgressDirectly(val: number): void;
    private getProgress(percentage);
}
export declare function getValueInProperRange(value: number, max: number, min?: number): number;
export declare function convertInPercentage(value: number, max: number): number;
export declare class IgxProgressBarModule {
}
