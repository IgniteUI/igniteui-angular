// Note: Currently this directive can't directly set the innerHTML of the parent element,
// as this breaks any existing ngTemplateOutlet (and possibly other) bindings. This happens, because the
// comment nodes that Angular uses for them get recreated by setting innerHTML. It seems like even if
// you recreate them with the exact same content they still don't work, so I had to wrokaround
// this by using appendChild and removeChild to modify the DOM without touching the comment nodes.

import { AfterViewInit, Directive, ElementRef, Input, NgModule, OnDestroy, Renderer2 } from "@angular/core";

import { ActiveHighlightManager } from "./active-higlight-manager";

@Directive({
    selector: "[igxTextHighlight]"
})
export class IgxTextHighlightDirective implements OnDestroy, AfterViewInit {

    @Input("cssClass")
    public cssClass: string;

    @Input("activeCssClass")
    public activeCssClass: string;

    @Input("groupName")
    public groupName: string = "";

    public parentElement: any;

    private _lastSearchedText: string = null;
    private _lastSearchCount = -1;

    private _storedText:string = null;

    constructor(element: ElementRef, public renderer: Renderer2) {
        this.parentElement = this.renderer.parentNode(element.nativeElement);
    }

    ngAfterViewInit() {
        ActiveHighlightManager.registerHighlightInfo(this);
    }

    ngOnDestroy() {
        ActiveHighlightManager.unregisterHighlightInfo(this);
    }

    public highlight(text: string, caseSensitive?: boolean): number {
        if (this._lastSearchedText === null || this._lastSearchedText !== text || this._storedText !== null) {
            this._lastSearchedText = text;

            if (text === "" || text === undefined || text === null) {
                this.clearHighlight();
                return 0;
            }

            const content = this.clearChildElements(false);
            this._lastSearchCount = this.getHighlightedText(content, text, caseSensitive);
        }

        return this._lastSearchCount;
    }

    public clearHighlight() {
        const textContent = this.clearChildElements(false);
        this.appendText(textContent);
    }

    public store() {
        if (this._lastSearchedText) {
            this._storedText = this._lastSearchedText;
            this.clearChildElements(true);
        }
    }

    public restore() {
        setTimeout(() => {
            if (this._storedText) {
                this.highlight(this._storedText);
                ActiveHighlightManager.restoreHighlight(this.groupName);
                this._storedText = null;
            }
        }, 0);
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
        ActiveHighlightManager.registerHighlight(this, childNodes[childNodes.length - 1], this._storedText !== null);
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
