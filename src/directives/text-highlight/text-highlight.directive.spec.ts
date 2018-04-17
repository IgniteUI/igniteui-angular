import { Component, ElementRef, forwardRef, ViewChild } from "@angular/core";

import {
    async,
    TestBed
} from "@angular/core/testing";

import { By } from "@angular/platform-browser";

import { IgxTextHighlightDirective } from "./text-highlight.directive";

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
        component.activateHighlight(2);
        fix.detectChanges();

        const spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[2]);

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

});

@Component({
    template:
        // tslint:disable-next-line:max-line-length
        `<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vulputate luctus dui ut maximus. Quisque sed suscipit lorem. Vestibulum sit.</div>`
})
class HighlightLoremIpsumComponent {
    public highlightClass = "igx-highlight";
    public activeHighlightClass = "igx-highlight__active";

    @ViewChild(forwardRef(() => IgxTextHighlightDirective), { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    public highlightText(text: string, caseSensitive?: boolean) {
        return this.highlight.highlight(text, caseSensitive);
    }

    public clearHighlight() {
        this.highlight.clearHighlight();
    }

    public activateHighlight(highlightNumber: number) {
        this.highlight.activate(highlightNumber);
    }

    public get textContent(): string {
        return this.highlight.parentElement.innerText;
    }
}
