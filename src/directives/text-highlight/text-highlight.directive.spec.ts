import { Component, ElementRef, forwardRef, ViewChild } from "@angular/core";

import {
    async,
    TestBed
} from "@angular/core/testing";

import { By } from "@angular/platform-browser";

import { ActiveHighlightManager } from "./active-higlight-manager";
import { IgxTextHighlightDirective} from "./text-highlight.directive";

fdescribe("IgxHighlight", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTextHighlightDirective,
                HighlightLoremIpsumComponent
            ]
        });
    }));

    it("Should highlight all instances of text", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        let count = component.highlightText("a");
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        count = component.highlightText("AM");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(1);
        expect(count).toBe(1);

        count = component.highlightText("amxsxd");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it("Should highlight all instances of text case sensitive", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        let count = component.highlightText("Lorem", true);
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(1);
        expect(count).toBe(1);

        count = component.highlightText("quisque", true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it("Should clear all highlights", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        const count = component.highlightText("a");
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        component.clearHighlight();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it("Should keep the text content of the DIV intact", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        const originalTextContent = component.textContent;

        component.highlightText("Lorem");
        fix.detectChanges();
        const loremText = component.textContent;
        expect(loremText).toBe(originalTextContent);

        component.clearHighlight();
        fix.detectChanges();
        const clearedText = component.textContent;
        expect(clearedText).toBe(originalTextContent);
    });

    it("Should activate the correct span", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText("a");
        component.activateNext();
        fix.detectChanges();

        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[0]);

        component.activateNext();
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[1]);

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        component.clearHighlight();
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBeNull();
    });

    it("Should properly handle null and undefined searches", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText("a");
        fix.detectChanges();

        let count = component.highlightText(null);
        fix.detectChanges();

        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);

        component.highlightText("a");
        fix.detectChanges();

        count = component.highlightText(undefined);
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);

        component.highlightText("a");
        fix.detectChanges();

        count = component.highlightText("");
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it("Should properly store and restore the highlight", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText("a");
        component.activateNext();

        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[0]);

        component.store();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);

        expect(spans.length).toBe(0);

        component.restore();
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);
        expect(spans.length).toBe(4);
        expect(activeSpan).toBe(spans[0]);

        component.activateNext();
        fix.detectChanges();
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[1]);

        component.store();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);

        expect(spans.length).toBe(0);

        component.restore();
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);
        expect(spans.length).toBe(4);
        expect(activeSpan).toBe(spans[1]);
    });

    it("Should properly store and restore the highlight case sensitive", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText("Lorem", true);
        component.activateNext();

        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[0]);
        expect(spans.length).toBe(1);

        component.store();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);

        expect(spans.length).toBe(0);

        component.restore();
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);
        expect(spans.length).toBe(1);
        expect(activeSpan).toBe(spans[0]);
    });

    it("Should properly store and restore when DOM is changed", () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText("a");
        component.activateNext();

        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[0]);

        component.store();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);

        expect(spans.length).toBe(0);

        component.restore(`<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName">Lorem ipsum dolor</div>`);
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);
        expect(spans.length).toBe(0);
        expect(activeSpan).toBe(null);

        component.highlightText("f");

        component.store();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);

        expect(spans.length).toBe(0);

        component.restore(`<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName">Fortify</div>`);
        fix.detectChanges();

        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);
        expect(spans.length).toBe(2);
        expect(activeSpan).toBe(spans[0]);
    });


});

@Component({
    template:
        // tslint:disable-next-line:max-line-length
        `<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vulputate luctus dui ut maximus. Quisque sed suscipit lorem. Vestibulum sit.</div>`
})
class HighlightLoremIpsumComponent {
    public highlightClass = "igx-highlight";
    public activeHighlightClass = "igx-highlight__active";
    public groupName = "test";

    @ViewChild(forwardRef(() => IgxTextHighlightDirective), { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    constructor(private element: ElementRef){}

    public highlightText(text: string, caseSensitive?: boolean) {
        return this.highlight.highlight(text, caseSensitive);
    }

    public clearHighlight() {
        this.highlight.clearHighlight();
    }

    public activateNext() {
        ActiveHighlightManager.moveNext(this.groupName);
    }

    public get textContent(): string {
        return this.highlight.parentElement.innerText;
    }

    public store() {
        this.highlight.store();
    }

    public restore(innerHTML?: string) {
        this.element.nativeElement.innerHTML = innerHTML ? innerHTML :
        // tslint:disable-next-line:max-line-length
        `<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vulputate luctus dui ut maximus. Quisque sed suscipit lorem. Vestibulum sit.</div>`;
        this.highlight.restore();
    }
}
