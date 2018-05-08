import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges
} from "@angular/core";

interface ISearchInfo {
    searchedText: string;
    content: string;
    matchCount: number;
    caseSensitive: boolean;
}

interface IActiveHighlightInfo {
    rowIndex: number;
    columnIndex: number;
    index: number;
}

@Directive({
    selector: "[igxTextHighlight]"
})
export class IgxTextHighlightDirective implements OnDestroy, OnInit, OnChanges {
    private _lastSearchInfo: ISearchInfo;
    private _addedElements = [];
    private _observer: MutationObserver;
    private _nodeWasRemoved = false;
    private _forceEvaluation = false;
    private _activeElementIndex = -1;

    private static _highlightGroupsMap = new Map<string, IActiveHighlightInfo>();

    @Input("cssClass")
    public cssClass: string;

    @Input("activeCssClass")
    public activeCssClass: string;

    @Input("groupName")
    public groupName = "";

    @Input("value")
    public value: any = "";

    @Input("row")
    public row: number;

    @Input("column")
    public column: number;

    @Output()
    public static onActiveElementChanged = new EventEmitter();

    public parentElement: any;

    constructor(element: ElementRef, public renderer: Renderer2) {
        this.parentElement = this.renderer.parentNode(element.nativeElement);

        const callback = (mutationList) => {
            mutationList.forEach(mutation => {
                mutation.removedNodes.forEach(n => {
                    if (n.id === "content") {
                        this._nodeWasRemoved = true;
                        this.clearChildElements(false);
                    }
                });

                mutation.addedNodes.forEach(n => {
                    if (n.id === "content" && this._nodeWasRemoved) {
                        this._nodeWasRemoved = false;

                        this._forceEvaluation = true;
                        this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
                        this._forceEvaluation = false;

                        if (this._activeElementIndex !== -1) {
                            this.activate(this._activeElementIndex);
                        }
                    }
                });
            });
        }

        this._observer = new MutationObserver(callback);
        this._observer.observe(this.parentElement, {childList: true});

        IgxTextHighlightDirective.onActiveElementChanged.subscribe((ev) => {
            if (this._activeElementIndex !== -1) {
                this.deactivate();
            }

            if (this.groupName === ev.groupName &&
                this.column === ev.column &&
                this.row === ev.row) {
                this.activate(ev.index);
            }
        });
    }

    ngOnInit() {
        if (IgxTextHighlightDirective._highlightGroupsMap.has(this.groupName) === false) {
            IgxTextHighlightDirective._highlightGroupsMap.set(this.groupName, {
                rowIndex: -1,
                columnIndex: -1,
                index: -1
            });
        }

        this._lastSearchInfo = {
            searchedText: "",
            content: this.value,
            matchCount: 0,
            caseSensitive: false
        };

        console.log(this.value);
    }

    ngOnDestroy() {
        this._observer.disconnect();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && !changes.value.firstChange) {
            this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
        }

        if ((changes.row && !changes.row.firstChange) || (changes.column && !changes.column.firstChange)) {
            if (this._activeElementIndex !== -1) {
                this.deactivate();
            }

            const group = IgxTextHighlightDirective._highlightGroupsMap.get(this.groupName);
            if (group.columnIndex === this.column && group.rowIndex === this.row) {
                if (this._activeElementIndex !== -1) {
                    this.deactivate();
                }
                this.activate(group.index);
            }
        }

    }

    public static setActiveHighlight(groupName: string, column: number, row: number, index: number) {
        const group = IgxTextHighlightDirective._highlightGroupsMap.get(groupName);

        group.columnIndex = column;
        group.rowIndex = row;
        group.index = index;

        IgxTextHighlightDirective.onActiveElementChanged.emit({
            groupName: groupName,
            column: column,
            row: row,
            index: index
        })
    }

    public highlight(text: string, caseSensitive?: boolean): number {
        if (!this.value) {
            return 0;
        }
        const caseSensitiveResolved = caseSensitive ? true : false;

        if (this.searchNeedsEvaluation(text, caseSensitiveResolved)) {
            this._lastSearchInfo.searchedText = text;
            this._lastSearchInfo.caseSensitive = caseSensitiveResolved;
            this._lastSearchInfo.content = this.value;

            if (text === "" || text === undefined || text === null) {
                this.clearHighlight();
                return 0;
            }

            this.clearChildElements(true);
            this._lastSearchInfo.matchCount = this.getHighlightedText(text, caseSensitive);
        }

        return this._lastSearchInfo.matchCount;
    }

    public clearHighlight() {
        this.clearChildElements(false);

        this._lastSearchInfo.searchedText = "";
        this._lastSearchInfo.matchCount = 0;
    }

    public activate(index: number) {
        const spans = this._addedElements.filter(el => el.nodeName === "SPAN");

        if (spans.length <= index) {
            return;
        }

        this._activeElementIndex = index;
        const elementToActivate = spans[index];
        this.renderer.addClass(elementToActivate, this.activeCssClass);
        this.renderer.setAttribute(elementToActivate, "style", "background:orange;font-weight:bold");
    }

    public deactivate() {
        if (this._activeElementIndex === -1) {
            return;
        }

        const spans = this._addedElements.filter(el => el.nodeName === "SPAN");

        if (spans.length <= this._activeElementIndex) {
            this._activeElementIndex = -1;
            return;
        }

        const elementToDeactivate = spans[this._activeElementIndex];
        this.renderer.removeClass(elementToDeactivate, this.activeCssClass);
        this.renderer.setAttribute(elementToDeactivate, "style", "background:yellow;font-weight:bold");
        this._activeElementIndex = -1;
    }

    private clearChildElements(originalContentHidden: boolean): void {
        const content = this.parentElement.querySelector("#content");
        if (content) {
            this.renderer.setProperty(content, "hidden", originalContentHidden);
        }

        while (this._addedElements.length) {
            const el = this._addedElements.pop();

            this.renderer.removeChild(this.parentElement, el);
        }

        this._activeElementIndex = -1;
    }

    private getHighlightedText(searchText: string, caseSensitive: boolean) {
        const stringValue = String(this.value);
        const contentStringResolved = !caseSensitive ? stringValue.toLowerCase() : stringValue;
        const searchTextResolved = !caseSensitive ? searchText.toLowerCase() : searchText;

        let foundIndex = contentStringResolved.indexOf(searchTextResolved, 0);
        let previousMatchEnd = 0;
        let matchCount = 0;

        while (foundIndex !== -1) {
            const start = foundIndex;
            const end = foundIndex + searchTextResolved.length;

            this.appendText(stringValue.substring(previousMatchEnd, start));
            // tslint:disable-next-line:max-line-length
            this.appendSpan(`<span class="${this.cssClass}" style="background:yellow;font-weight:bold">${stringValue.substring(start, end)}</span>`);

            previousMatchEnd = end;
            matchCount++;

            foundIndex = contentStringResolved.indexOf(searchTextResolved, end);
        }

        this.appendText(stringValue.substring(previousMatchEnd, stringValue.length));

        return matchCount;
    }

    private appendText(text: string) {
        const textElement = this.renderer.createText(text);
        this.renderer.appendChild(this.parentElement, textElement);
        this._addedElements.push(textElement);
    }

    private appendSpan(outerHTML: string) {
        const span = this.renderer.createElement("span");
        this.renderer.appendChild(this.parentElement, span);
        this.renderer.setProperty(span, "outerHTML", outerHTML);

        const childNodes = this.parentElement.childNodes;
        this._addedElements.push(childNodes[childNodes.length - 1]);
    }

    private searchNeedsEvaluation(text: string, caseSensitive: boolean): boolean {
        const searchedText = this._lastSearchInfo.searchedText;

        return !this._nodeWasRemoved &&
                (searchedText === null ||
                searchedText !== text ||
                this._lastSearchInfo.content !== this.value ||
                this._lastSearchInfo.caseSensitive !== caseSensitive ||
                this._forceEvaluation);
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
