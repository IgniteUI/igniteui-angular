import { Component, forwardRef, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { IgxTextHighlightDirective, IActiveHighlightInfo} from './text-highlight.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxHighlight', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTextHighlightDirective,
                HighlightLoremIpsumComponent
            ]
        });
    }));

    it('Highlight inputs should have the proper values', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;

        expect(component.highlight.cssClass).toBe('igx-highlight');
        expect(component.highlight.activeCssClass).toBe('igx-highlight__active');
        expect(component.highlight.groupName).toBe('test');
        expect(component.highlight.value).toBe(component.html);
        expect(component.highlight.row).toBe(0);
        expect(component.highlight.column).toBe(0);
        expect(component.highlight.containerClass).toBe('test');
    });

    it('Should highlight all instances of text', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        let count = component.highlightText('a');

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        count = component.highlightText('AM');

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(1);
        expect(count).toBe(1);

        count = component.highlightText('amxsxd');

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it('Should highlight all instances of text case sensitive', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        let count = component.highlightText('Lorem', true);

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(1);
        expect(count).toBe(1);

        count = component.highlightText('quisque', true);

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it('Should not highlight anything when there is no exact match, regardless of case sensitivity.', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        let count = component.highlightText('Lorem', false, true);

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);

        count = component.highlightText('Lorem', false, false);

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(2);
        expect(count).toBe(2);

        count = component.highlightText('Lorem', true, true);

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it('Should not highlight with exact match when the group text has changed.', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        const count = component.highlightText(
            'LoReM ipsuM dolor sit AMET, consectetur adipiscing elit. Vestibulum vulputate LucTUS dui ut maximus.' +
            ' Quisque sed suscipit lorem. Vestibulum sit.',
            false, true);

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(1);
        expect(count).toBe(1);

        component.html += ' additionalText';
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it('Should clear all highlights', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        const count = component.highlightText('a');

        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        component.clearHighlight();

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it('Should keep the text content of the DIV intact', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        const originalTextContent = component.textContent;

        component.highlightText('Lorem');

        const loremText = component.textContent;
        expect(loremText).toBe(originalTextContent);

        component.clearHighlight();

        const clearedText = component.textContent;
        expect(clearedText).toBe(originalTextContent);
    });

    it('Should activate the correct span', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText('a');
        component.activate(0);


        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        let activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[0]);

        component.activate(1);


        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeHighlightClass);

        expect(activeSpan).toBe(spans[1]);

        const allActiveSpans = fix.debugElement.nativeElement.querySelectorAll('.' + component.activeHighlightClass);
        expect(allActiveSpans.length).toBe(1);

        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeHighlightClass);

        component.clearHighlight();
        activeSpan = fix.debugElement.nativeElement.querySelector('.' + component.activeHighlightClass);

        expect(activeSpan).toBeNull();
    });

    it('Should properly handle null and undefined searches', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText('a');


        let count = component.highlightText(null);


        let spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);

        component.highlightText('a');


        count = component.highlightText(undefined);


        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);

        component.highlightText('a');


        count = component.highlightText('');


        spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
        expect(count).toBe(0);
    });

    it('Should properly handle value changes', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText('a');
        component.html = 'zzzzzzzzz';
        fix.detectChanges();

        const spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it('Should properly handle value changes - case sensitive', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText('a', true);
        component.html = 'AAAAAAAAAA';
        fix.detectChanges();

        const spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it('Should properly handle empty or null values', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;

        component.html = null;
        component.highlightText('z', true);
        fix.detectChanges();
        expect(component.textContent).toBe('');

        component.clearHighlight();

        expect(component.textContent).toBe('');

        component.html = undefined;
        component.highlightText('z', true);
        fix.detectChanges();
        expect(component.textContent).toBe('');

        component.clearHighlight();

        expect(component.textContent).toBe('');
    });

    it('Should apply correct styles on the highlight and active highlight spans', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlightText('a');
        component.activate(0);

        const spans = fix.debugElement.nativeElement.querySelectorAll('.' + component.highlightClass);
        const activeSpans = fix.debugElement.nativeElement.querySelectorAll('.' + component.activeHighlightClass);
        expect(spans.length).toBe(4);
        expect(activeSpans.length).toBe(1);
    });

    it('Should not throw error when active highlight is not set', () => {
        const fix = TestBed.createComponent(HighlightLoremIpsumComponent);
        fix.detectChanges();

        const component: HighlightLoremIpsumComponent = fix.debugElement.componentInstance;
        component.highlight.row = undefined;
        component.highlight.column = undefined;
        component.highlightText('a');

        expect(() => component.highlight.activateIfNecessary()).not.toThrowError();
    });

});

@Component({
    template:
    // eslint-disable-next-line max-len
    `<div igxTextHighlight [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName" [value]="html" [column]="0" [row]="0" [containerClass]="'test'">
        {{html}}
    </div>`
})
class HighlightLoremIpsumComponent {
    @ViewChild(forwardRef(() => IgxTextHighlightDirective), { read: IgxTextHighlightDirective, static: true })
    public highlight: IgxTextHighlightDirective;

    public highlightClass = 'igx-highlight';
    public activeHighlightClass = 'igx-highlight__active';
    public groupName = 'test';

    // eslint-disable-next-line max-len
    public html = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vulputate luctus dui ut maximus. Quisque sed suscipit lorem. Vestibulum sit.';

    public highlightText(text: string, caseSensitive?: boolean, exactMatch?: boolean) {
        return this.highlight.highlight(text, caseSensitive, exactMatch);
    }

    public clearHighlight() {
        this.highlight.clearHighlight();
    }

    public get textContent(): string {
        return this.highlight.parentElement.innerText;
    }

    public activate(index: number) {
        const activeHighlightInfo: IActiveHighlightInfo = {
            row: 0,
            column: 0,
            index
        };
        IgxTextHighlightDirective.setActiveHighlight(this.groupName, activeHighlightInfo);
    }
}
