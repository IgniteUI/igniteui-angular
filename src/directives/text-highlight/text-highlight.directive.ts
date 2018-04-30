// Note: Currently this directive can't directly set the innerHTML of the parent element,
// as this breaks any existing ngTemplateOutlet (and possibly other) bindings. This happens, because the
// comment nodes that Angular uses for them get recreated by setting innerHTML. It seems like even if
// you recreate them with the exact same content they still don't work, so I had to wrokaround
// this by using appendChild and removeChild to modify the DOM without touching the comment nodes.

import { AfterViewInit, Directive, ElementRef, Input, NgModule, OnDestroy, Renderer2 } from "@angular/core";

import { ActiveHighlightManager } from "./active-higlight-manager";

interface ISearchInfo {
    searchedText: string;
    matchCount: number;
    caseSensitive: boolean;
    stored: boolean;
}

@Directive({
    selector: "[igxTextHighlight]"
})
export class IgxTextHighlightDirective implements OnDestroy, AfterViewInit {
    private _lastSearchInfo: ISearchInfo;

    @Input("cssClass")
    public cssClass: string;

    @Input("activeCssClass")
    public activeCssClass: string;

    @Input("groupName")
    public groupName = "";

    public parentElement: any;

    constructor(element: ElementRef, public renderer: Renderer2) {
        this.parentElement = this.renderer.parentNode(element.nativeElement);

        this._lastSearchInfo = {
            searchedText: "",
            matchCount: 0,
            caseSensitive: false,
            stored: false
        };
    }

    ngAfterViewInit() {
        ActiveHighlightManager.registerHighlightInfo(this);
    }

    ngOnDestroy() {
        ActiveHighlightManager.unregisterHighlightInfo(this);
    }

    public highlight(text: string, caseSensitive?: boolean): number {
        if (this.searchNeedsEvaluation(text, caseSensitive ? true : false)) {
            this._lastSearchInfo.searchedText = text;
            this._lastSearchInfo.caseSensitive = caseSensitive ? true : false;

            if (text === "" || text === undefined || text === null) {
                this.clearHighlight();
                return 0;
            }

            const content = this.clearChildElements(false);
            this._lastSearchInfo.matchCount = this.getHighlightedText(content, text, caseSensitive);
        }

        return this._lastSearchInfo.matchCount;
    }

    public clearHighlight() {
        const textContent = this.clearChildElements(false);
        this.appendText(textContent);
    }

    public store() {
        const searchedText = this._lastSearchInfo.searchedText;

        if (searchedText) {
            this._lastSearchInfo.stored = true;
            this.clearChildElements(true);
        }
    }

    public restore() {
        if (this._lastSearchInfo.stored) {
            this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
            ActiveHighlightManager.restoreHighlight(this.groupName);
            this._lastSearchInfo.stored = false;
        }
    }

    private clearChildElements(store: boolean): string {
        let child = this.parentElement.firstChild;
        let text = "";

        while (child) {
            const elementToRemove = child;
            child = this.renderer.nextSibling(child);

            if (elementToRemove.nodeName !== "#comment") {
                text += elementToRemove.textContent;
                this.renderer.removeChild(this.parentElement, elementToRemove);
                ActiveHighlightManager.unregisterHighlight(this, elementToRemove, store);
            }
        }

        return text;
    }

    private getHighlightedText(contentString: string, searchText: string, caseSensitive: boolean) {
        const contentStringResolved = !caseSensitive ? contentString.toLowerCase() : contentString;
        const searchTextResolved = !caseSensitive ? searchText.toLowerCase() : searchText;

        let foundIndex = contentStringResolved.indexOf(searchTextResolved, 0);
        let previousMatchEnd = 0;
        let matchCount = 0;

        while (foundIndex !== -1) {
            const start = foundIndex;
            const end = foundIndex + searchTextResolved.length;

            this.appendText(contentString.substring(previousMatchEnd, start));
            // tslint:disable-next-line:max-line-length
            this.appendSpan(`<span class="${this.cssClass}" style="background:yellow;font-weight:bold">${contentString.substring(start, end)}</span>`);

            previousMatchEnd = end;
            matchCount++;

            foundIndex = contentStringResolved.indexOf(searchTextResolved, end);
        }

        this.appendText(contentString.substring(previousMatchEnd, contentString.length));

        return matchCount;
    }

    private appendText(text: string) {
        const textElement = this.renderer.createText(text);
        this.renderer.appendChild(this.parentElement, textElement);
    }

    private appendSpan(outerHTML: string) {
        const span = this.renderer.createElement("span");
        this.renderer.appendChild(this.parentElement, span);
        this.renderer.setProperty(span, "outerHTML", outerHTML);

        const childNodes = this.parentElement.childNodes;
        ActiveHighlightManager.registerHighlight(this, childNodes[childNodes.length - 1], this._lastSearchInfo.stored);
    }

    private searchNeedsEvaluation(text: string, caseSensitive: boolean): boolean {
        const searchedText = this._lastSearchInfo.searchedText;

        return searchedText === null ||
                searchedText !== text ||
                this._lastSearchInfo.stored ||
                this._lastSearchInfo.caseSensitive !== caseSensitive;
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
