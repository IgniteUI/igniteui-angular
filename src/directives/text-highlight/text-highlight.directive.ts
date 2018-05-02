import { AfterViewInit, Directive, ElementRef, Input, NgModule, OnChanges, OnDestroy, Renderer2, SimpleChanges } from "@angular/core";

import { ActiveHighlightManager } from "./active-higlight-manager";

interface ISearchInfo {
    searchedText: string;
    content: string;
    matchCount: number;
    caseSensitive: boolean;
    stored: boolean;
}

// TODO: Remove a dependency of a container with id of cellContent.
@Directive({
    selector: "[igxTextHighlight]"
})
export class IgxTextHighlightDirective implements OnDestroy, AfterViewInit, OnChanges {
    private _lastSearchInfo: ISearchInfo;
    private _addedElements = [];
    private _observer: MutationObserver;
    private _nodeWasRemoved = false;
    private _forceEvaluation = false;

    @Input("cssClass")
    public cssClass: string;

    @Input("activeCssClass")
    public activeCssClass: string;

    @Input("groupName")
    public groupName = "";

    @Input("value")
    public value: any = "";

    public parentElement: any;

    constructor(element: ElementRef, public renderer: Renderer2) {
        this.parentElement = this.renderer.parentNode(element.nativeElement);

        this._lastSearchInfo = {
            searchedText: "",
            content: this.value,
            matchCount: 0,
            caseSensitive: false,
            stored: false
        };

        const callback = (mutationList) => {
            mutationList.forEach(mutation => {
                mutation.removedNodes.forEach(n => {
                    if (n.id === "cellContent") {
                        this._nodeWasRemoved = true;
                        this.clearChildElements(false, false);
                    }
                });

                mutation.addedNodes.forEach(n => {
                    if (n.id === "cellContent" && this._nodeWasRemoved) {
                        this._nodeWasRemoved = false;

                        this._forceEvaluation = true;
                        this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
                        this._forceEvaluation = false;
                        // ActiveHighlightManager.restoreHighlight(this.groupName);
                    }
                });
            });
        }

        this._observer = new MutationObserver(callback);
        this._observer.observe(this.parentElement, {childList: true});
    }

    ngAfterViewInit() {
        //ActiveHighlightManager.registerHighlightInfo(this);
    }

    ngOnDestroy() {
        //ActiveHighlightManager.unregisterHighlightInfo(this);

        this._observer.disconnect();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && !changes.value.firstChange) {
            this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
        }
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

            this.clearChildElements(true, this._forceEvaluation === false);
            this._lastSearchInfo.matchCount = this.getHighlightedText(text, caseSensitive);
        }

        return this._lastSearchInfo.matchCount;
    }

    public clearHighlight() {
        this.clearChildElements(false, true);
    }

    private clearChildElements(originalContentHidden: boolean, updateActiveIndex: boolean): void {
        const content = this.parentElement.querySelector("#cellContent");
        if (content) {
            this.renderer.setProperty(content, "hidden", originalContentHidden);
        }

        while (this._addedElements.length) {
            const el = this._addedElements.pop();

            this.renderer.removeChild(this.parentElement, el);
            //ActiveHighlightManager.unregisterHighlight(this, el, updateActiveIndex);
        }
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

        //ActiveHighlightManager.registerHighlight(this, childNodes[childNodes.length - 1], this._forceEvaluation);
    }

    private searchNeedsEvaluation(text: string, caseSensitive: boolean): boolean {
        const searchedText = this._lastSearchInfo.searchedText;

        return !this._nodeWasRemoved &&
                (searchedText === null ||
                searchedText !== text ||
                this._lastSearchInfo.content !== this.value ||
                this._lastSearchInfo.stored ||
                this._lastSearchInfo.caseSensitive !== caseSensitive ||
                this._forceEvaluation);
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
