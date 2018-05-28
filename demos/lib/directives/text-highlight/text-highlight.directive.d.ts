import { AfterViewInit, ElementRef, OnChanges, OnDestroy, Renderer2, SimpleChanges } from "@angular/core";
export interface IActiveHighlightInfo {
    rowIndex: number;
    columnIndex: number;
    page: number;
    index: number;
}
export declare class IgxTextHighlightDirective implements AfterViewInit, OnDestroy, OnChanges {
    renderer: Renderer2;
    private static onActiveElementChanged;
    static highlightGroupsMap: Map<string, IActiveHighlightInfo>;
    private _lastSearchInfo;
    private _addedElements;
    private _observer;
    private _nodeWasRemoved;
    private _forceEvaluation;
    private _activeElementIndex;
    cssClass: string;
    activeCssClass: string;
    groupName: string;
    value: any;
    row: number;
    column: number;
    page: number;
    parentElement: any;
    private container;
    static setActiveHighlight(groupName: string, column: number, row: number, index: number, page: number): void;
    constructor(element: ElementRef, renderer: Renderer2);
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    highlight(text: string, caseSensitive?: boolean): number;
    clearHighlight(): void;
    activateIfNecessary(): void;
    private activate(index);
    private deactivate();
    private clearChildElements(originalContentHidden);
    private getHighlightedText(searchText, caseSensitive);
    private appendText(text);
    private appendSpan(outerHTML);
    private searchNeedsEvaluation(text, caseSensitive);
}
export declare class IgxTextHighlightModule {
}
