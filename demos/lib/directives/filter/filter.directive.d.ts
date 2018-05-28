import { ElementRef, EventEmitter, OnChanges, PipeTransform, Renderer2, SimpleChanges } from "@angular/core";
export declare class IgxFilterDirective implements OnChanges {
    private element;
    filtering: EventEmitter<{}>;
    filtered: EventEmitter<{}>;
    filterOptions: IgxFilterOptions;
    constructor(element: ElementRef, renderer: Renderer2);
    ngOnChanges(changes: SimpleChanges): void;
    private filter();
}
export declare class IgxFilterPipe implements PipeTransform {
    transform(items: any[], options: IgxFilterOptions): any[];
}
export declare class IgxFilterOptions {
    inputValue: string;
    key: string;
    items: any[];
    get_value(item: any, key: string): string;
    formatter(valueToTest: string): string;
    matchFn(valueToTest: string, inputValue: string): boolean;
    metConditionFn(item: any): void;
    overdueConditionFn(item: any): void;
}
export declare class IgxFilterModule {
}
