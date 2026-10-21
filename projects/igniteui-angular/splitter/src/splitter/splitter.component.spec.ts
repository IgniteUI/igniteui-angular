import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, DebugElement, ChangeDetectionStrategy, provideZonelessChangeDetection } from '@angular/core';
import { SplitterType, IgxSplitterComponent, ISplitterBarResizeEventArgs } from './splitter.component';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const SPLITTERBAR_CLASS = 'igx-splitter-bar';
const SPLITTERBAR_DIV_CLASS = '.igx-splitter-bar';
const SPLITTER_BAR_VERTICAL_CLASS = 'igx-splitter-bar--vertical';
const COLLAPSIBLE_CLASS = 'igx-splitter-bar--collapsible';

describe('IgxSplitter', () => {
    beforeEach(async () => await TestBed.configureTestingModule({
        imports: [
            SplitterTestComponent
        ]
    }).compileComponents());
    let fixture: ComponentFixture<SplitterTestComponent>;
    let splitter: IgxSplitterComponent;

    beforeEach(async () => {
        fixture = TestBed.createComponent(SplitterTestComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    });

    it('should render pane content correctly in splitter.', () => {
        expect(splitter.panes.length).toBe(2);
        const firstPane = splitter.panes.toArray()[0].element;
        const secondPane = splitter.panes.toArray()[1].element;
        expect(firstPane.textContent.trim()).toBe('Pane 1');
        expect(secondPane.textContent.trim()).toBe('Pane 2');
        fixture.detectChanges();
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        expect(firstPane.style.order).toBe('0');
        expect(splitterBar.style.order).toBe('1');
        expect(secondPane.style.order).toBe('2');
    });

    it('should correctly add the collapsible class.', () => {
        const splitterBarDIV = fixture.debugElement.query(By.css(SPLITTERBAR_DIV_CLASS)).nativeElement;
        const collapsibleClass = splitterBarDIV.classList.contains(COLLAPSIBLE_CLASS);
        expect(collapsibleClass).toBeTruthy();

        splitter.nonCollapsible = true;
        fixture.detectChanges();

        const noCollapsibleClass = splitterBarDIV.classList.contains(COLLAPSIBLE_CLASS);
        expect(noCollapsibleClass).toBeFalsy();
    });

    it('should render vertical splitter.', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();

        const splitterBarDIV = fixture.debugElement.query(By.css(SPLITTERBAR_DIV_CLASS));
        const hasVerticalClass = splitterBarDIV.nativeElement.classList.contains(SPLITTER_BAR_VERTICAL_CLASS);
        expect(hasVerticalClass).toBeFalsy();
    });
    it('should render horizontal splitter.', () => {
        const splitterBarDIV = fixture.debugElement.query(By.css(SPLITTERBAR_DIV_CLASS));
        const hasVerticalClass = splitterBarDIV.nativeElement.classList.contains(SPLITTER_BAR_VERTICAL_CLASS);
        expect(hasVerticalClass).toBeTruthy();
    });
    it('should allow resizing vertical splitter', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetHeight;
        const pane2_originalSize = pane2.element.offsetHeight;
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-100);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize + 100 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize - 100 + 'px');

        splitterBarComponent.moving.emit(100);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize - 100 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize + 100 + 'px');
    });
    it('should allow resizing horizontal splitter', () => {
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetWidth;
        const pane2_originalSize = pane2.element.offsetWidth;
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-100);
        fixture.detectChanges();

        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 100, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 100, 0);

        splitterBarComponent.moving.emit(100);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize - 100, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize + 100, 0);
    });
    it('should honor minSize/maxSize when resizing.', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        pane1.minSize = '100px';
        pane1.maxSize = '300px';
        fixture.detectChanges();

        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(100);
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(100);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe('100px');
        expect(pane2.dragSize).toBe('300px');

        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-200);
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-50);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe('300px');
        expect(pane2.dragSize).toBe('100px');
    });

    it('should not allow drag resize if resizable is set to false.', () => {
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        expect(splitterBarComponent.cursor).toBe('col-resize');
        const pane1 = splitter.panes.toArray()[0];
        pane1.resizable = false;
        fixture.detectChanges();
        const args = { cancel: false };
        splitterBarComponent.onDragStart(args);
        expect(args.cancel).toBeTruthy();
        expect(splitterBarComponent.cursor).toBe('');
    });

    it('should allow resizing with up/down arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetHeight;
        const pane2_originalSize = pane2.element.offsetHeight;
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize - 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize + 10 + 'px');

        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', splitterBarComponent.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize - 10 + 'px');

        pane2.resizable = false;
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize - 10 + 'px');
    });

    it('should allow resizing with left/right arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Horizontal;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetWidth;
        const pane2_originalSize = pane2.element.offsetWidth;
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize - 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize + 10, 0);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponent.nativeElement);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 10, 0);

        pane1.resizable = false;
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponent.nativeElement);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 10, 0);
    });

    it('should allow expand/collapse with Ctrl + up/down arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeFalsy();
    });

    it('should allow expand/collapse with Ctrl + left/right arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Horizontal;
        fixture.detectChanges();
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeTruthy();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', splitterBarComponent.nativeElement, true, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeFalsy();
    });

    it('should keep the splitter bar focused after a pane is collapsed with the keyboard', () => {
        const pane1 = splitter.panes.toArray()[0];
        const splitterBar: HTMLElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        splitterBar.focus();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', splitterBar, true, false, false, true);
        fixture.detectChanges();

        expect(pane1.collapsed).toBe(true);
        expect(splitterBar.getAttribute('tabindex')).toBe('0');
        expect(document.activeElement).toBe(splitterBar);
    });

    it('should keep the splitter bar in the tab order unless it can neither resize nor collapse the panes', () => {
        const splitterBar: HTMLElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        const cases = [
            { nonCollapsible: false, resizable: true, collapsed: false, tabindex: '0' },
            { nonCollapsible: false, resizable: false, collapsed: false, tabindex: '0' },
            { nonCollapsible: true, resizable: true, collapsed: false, tabindex: '0' },
            { nonCollapsible: true, resizable: false, collapsed: false, tabindex: null },
            // A collapsed pane cannot be resized.
            { nonCollapsible: true, resizable: true, collapsed: true, tabindex: null }
        ];

        for (const { nonCollapsible, resizable, collapsed, tabindex } of cases) {
            splitter.nonCollapsible = nonCollapsible;
            splitter.panes.first.resizable = resizable;
            splitter.panes.first.collapsed = collapsed;
            fixture.detectChanges();
            expect(splitterBar.getAttribute('tabindex'), `nonCollapsible: ${nonCollapsible}, resizable: ${resizable}, collapsed: ${collapsed}`).toBe(tabindex);
        }
    });

    it('should not collapse a pane with Ctrl + arrow keys when nonCollapsible is set', () => {
        const pane1 = splitter.panes.toArray()[0];
        const splitterBar: HTMLElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        splitter.nonCollapsible = true;
        fixture.detectChanges();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', splitterBar, true, false, false, true);
        fixture.detectChanges();

        expect(pane1.collapsed).toBe(false);
    });

    it('should prevent the default action and stop the propagation of the arrow keys in either orientation', () => {
        const splitterBar: HTMLElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        const parentListener = vi.fn();
        splitter.panes.first.element.parentElement.addEventListener('keydown', parentListener);

        for (const ctrlKey of [false, true]) {
            for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
                const event = new KeyboardEvent('keydown', { key, ctrlKey, bubbles: true, cancelable: true });
                splitterBar.dispatchEvent(event);
                expect(event.defaultPrevented, `${ctrlKey ? 'Ctrl+' : ''}${key} should be prevented`).toBe(true);
            }
        }
        expect(parentListener).not.toHaveBeenCalled();
    });

    it('should keep resizing the panes while an arrow key is held', () => {
        const splitterBarDebug = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        const splitterBar: HTMLElement = splitterBarDebug.nativeElement;
        vi.spyOn(splitterBarDebug.componentInstance.moving, 'emit');

        splitterBar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        const repeated = new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true, bubbles: true, cancelable: true });
        splitterBar.dispatchEvent(repeated);

        expect(splitterBarDebug.componentInstance.moving.emit).toHaveBeenCalledTimes(2);
        expect(splitterBarDebug.componentInstance.moving.emit).toHaveBeenLastCalledWith(10);
        expect(repeated.defaultPrevented).toBe(true);
    });

    it('should preserve horizontal pane sizes after collapse and expand', () => {
        const [pane1, pane2] = splitter.panes.toArray();
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).componentInstance;
        pane1.size = '30%';
        pane2.size = '70%';
        fixture.detectChanges();

        const pane1Width = pane1.element.offsetWidth;
        const pane2Width = pane2.element.offsetWidth;

        splitterBar.onCollapsing(false);
        fixture.detectChanges();
        splitterBar.onCollapsing(false);
        fixture.detectChanges();

        expect(pane1.size).toBe('30%');
        expect(pane2.size).toBe('70%');
        expect(Math.abs(pane1.element.offsetWidth - pane1Width)).toBeLessThanOrEqual(1);
        expect(Math.abs(pane2.element.offsetWidth - pane2Width)).toBeLessThanOrEqual(1);
    });

    it('should preserve vertical pane sizes after collapse and expand', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();

        const [pane1, pane2] = splitter.panes.toArray();
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).componentInstance;
        pane1.element.parentElement.style.height = '600px';
        pane1.size = '30%';
        pane2.size = '70%';
        fixture.detectChanges();

        const pane1Height = pane1.element.offsetHeight;
        const pane2Height = pane2.element.offsetHeight;

        splitterBar.onCollapsing(false);
        fixture.detectChanges();
        splitterBar.onCollapsing(false);
        fixture.detectChanges();

        expect(pane1.size).toBe('30%');
        expect(pane2.size).toBe('70%');
        expect(Math.abs(pane1.element.offsetHeight - pane1Height)).toBeLessThanOrEqual(1);
        expect(Math.abs(pane2.element.offsetHeight - pane2Height)).toBeLessThanOrEqual(1);
    });

    it('should let a fixed-size pane fill space without losing its configured size', () => {
        const [pane1, pane2] = splitter.panes.toArray();
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).componentInstance;
        pane1.element.parentElement.style.width = '600px';
        pane1.size = '100px';
        pane2.size = '100px';
        fixture.detectChanges();

        const pane1Width = pane1.element.offsetWidth;
        const pane2Width = pane2.element.offsetWidth;

        splitterBar.onCollapsing(false);
        fixture.detectChanges();

        expect(pane2.size).toBe('100px');
        expect(pane2.element.offsetWidth).toBeGreaterThan(pane2Width);

        splitterBar.onCollapsing(false);
        fixture.detectChanges();

        expect(pane1.element.offsetWidth).toBe(pane1Width);
        expect(pane2.element.offsetWidth).toBe(pane2Width);
    });

    it('should allow resize in % when pane size is auto.', () => {
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetWidth;
        const pane2_originalSize = pane2.element.offsetWidth;
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-100);
        fixture.detectChanges();

        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 100, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 100, 0);

        // on move end convert to % value and apply to size.
        splitterBarComponent.movingEnd.emit(-100);
        fixture.detectChanges();

        expect(pane1.size.indexOf('%') !== -1).toBe(true);
        expect(pane2.size.indexOf('%') !== -1).toBe(true);

        expect(pane1.element.offsetWidth).toBeCloseTo(pane1_originalSize + 100);
        expect(pane2.element.offsetWidth).toBeCloseTo(pane2_originalSize - 100);
    });

    it('should allow mixing % and px sizes.', () => {
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        pane1.size = '200px';
        fixture.detectChanges();

        const pane1_originalSize = pane1.element.offsetWidth;
        const pane2_originalSize = pane2.element.offsetWidth;
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-100);
        fixture.detectChanges();

        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 100, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 100, 0);

        // on move end convert to % value and apply to size.
        splitterBarComponent.movingEnd.emit(-100);
        fixture.detectChanges();

        // fist pane should remain in px
        expect(pane1.size).toBe('300px');
        expect(pane2.size.indexOf('%') !== -1).toBe(true);

        expect(pane1.element.offsetWidth).toBeCloseTo(pane1_originalSize + 100);
        expect(pane2.element.offsetWidth).toBeCloseTo(pane2_originalSize - 100);
    });

    it('should reset transform style of vertical splitter bar after dragging', async () => {
        const pane1 = splitter.panes.toArray()[0];
        pane1.size = '200px';
        fixture.detectChanges();

        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;

        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBar.moveStart.emit(pane1);
        splitterBar.moving.emit(-150);
        fixture.detectChanges();

        splitterBar.movingEnd.emit(50);
        fixture.detectChanges();

        expect(splitterBarComponent.style.transform).not.toBe('translate3d(0px, 0px, 0px)');
    });

    it('should render correctly panes created dynamically using @for', () => {
        fixture = TestBed.createComponent(SplitterForOfPanesComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
        expect(splitter.panes.length).toBe(3);
    });
});

describe('IgxSplitter pane toggle', () => {
    beforeEach(async () => await TestBed.configureTestingModule({
        imports: [
            SplitterTogglePaneComponent
        ]
    }).compileComponents());

    let fixture;
    let splitter;
    beforeEach(async () => {
        fixture = TestBed.createComponent(SplitterTogglePaneComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
        fixture.detectChanges();
    });

    it('should collapse/expand panes', () => {
        const pane1 = splitter.panes.toArray()[0];
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;

        // collapse left sibling pane
        splitterBarComponent.onCollapsing(0);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();

        // expand left sibling pane
        splitterBarComponent.onCollapsing(1);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
    });

    it('should be able to expand both siblings when they are collapsed', () => {
        const panes = splitter.panes.toArray();
        const pane1 = panes[0];
        const pane2 = panes[1];
        const splitterBarComponents = fixture.debugElement.queryAll(By.css(SPLITTERBAR_CLASS));
        const splitterBar1 = splitterBarComponents[0].context;
        const splitterBar2 = splitterBarComponents[1].context;

        splitterBar1.onCollapsing(0);
        splitterBar2.onCollapsing(0);
        fixture.detectChanges();

        expect(pane1.collapsed).toBeTruthy();
        expect(pane2.collapsed).toBeTruthy();

        splitterBar1.onCollapsing(1);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
    });

    it('should not be able to resize a pane when it is collapsed', () => {
        const pane1 = splitter.panes.toArray()[0];
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;

        pane1.size = '340';
        const pane1_originalSize = pane1.size;
        const splitterBarComponentDebug: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));

        // collapse left sibling pane
        splitterBarComponent.onCollapsing(0);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();
        expect(pane1.resizable).toBeTruthy();
        splitterBarComponentDebug.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', splitterBarComponentDebug.nativeElement);
        fixture.detectChanges();
        expect(pane1.size).toEqual(pane1_originalSize);

        splitterBarComponent.onCollapsing(1);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
        expect(pane1.resizable).toBeTruthy();
    });

    it('should emit resizing events on splitter bar move: resizeStart, resizing, resizeEnd.', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        vi.spyOn(splitter.resizeStart, 'emit');
        vi.spyOn(splitter.resizing, 'emit');
        vi.spyOn(splitter.resizeEnd, 'emit');

        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        splitterBarComponent.moveStart.emit(pane1);
        fixture.detectChanges();
        splitterBarComponent.moving.emit(-100);
        fixture.detectChanges();
        splitterBarComponent.movingEnd.emit(-100);
        fixture.detectChanges();

        const args: ISplitterBarResizeEventArgs = {
            pane: pane1,
            sibling: pane2
        };
        expect(splitter.resizeStart.emit).toHaveBeenCalledTimes(1);
        expect(splitter.resizeStart.emit).toHaveBeenCalledWith(args);
        expect(splitter.resizing.emit).toHaveBeenCalledTimes(1);
        expect(splitter.resizing.emit).toHaveBeenCalledWith(args);
        expect(splitter.resizeEnd.emit).toHaveBeenCalledTimes(1);
        expect(splitter.resizeEnd.emit).toHaveBeenCalledWith(args);
    });
});

describe('IgxSplitter pane collapse', () => {
    beforeEach(async () => await TestBed.configureTestingModule({
        imports: [
            SplitterCollapsedPaneComponent
        ]
    }).compileComponents());

    let fixture;
    let splitter;
    beforeEach(async () => {
        fixture = TestBed.createComponent(SplitterCollapsedPaneComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    });

    it('should preserve sizes and constraints when pane is initially collapsed.', () => {
        const panes = splitter.panes.toArray();
        expect(panes.map(pane => pane.size)).toEqual(['30%', '30%', '30%']);
        expect(panes.map(pane => pane.minWidth)).toEqual(['10%', '20%', '5%']);
        expect(panes.map(pane => pane.maxWidth)).toEqual(['40%', '50%', '35%']);
        expect(panes[2].collapsed).toBe(true);
        expect(panes[2].display).toBe('none');
    });

    it('should let an initially fixed-size sibling fill space and restore its size', () => {
        const fixedFixture = TestBed.createComponent(SplitterCollapsedPaneComponent);
        fixedFixture.componentInstance.paneSizes = ['100px', '100px', '100px'];
        fixedFixture.componentInstance.paneMinSizes = ['0', '0', '0'];
        fixedFixture.componentInstance.paneMaxSizes = ['100%', '100%', '100%'];
        fixedFixture.componentInstance.splitterWidth = '600px';
        fixedFixture.detectChanges();
        const fixedSplitter = fixedFixture.componentInstance.splitter;
        const panes = fixedSplitter.panes.toArray();
        const splitterBar = fixedFixture.debugElement.queryAll(By.css(SPLITTERBAR_CLASS))[1].componentInstance;

        expect(panes.map(pane => pane.size)).toEqual(['100px', '100px', '100px']);
        expect(panes[0].element.offsetWidth).toBe(100);
        expect(panes[1].element.offsetWidth).toBeGreaterThan(100);

        splitterBar.onCollapsing(true);
        fixedFixture.detectChanges();

        expect(panes[2].collapsed).toBe(false);
        expect(panes.map(pane => pane.size)).toEqual(['100px', '100px', '100px']);
        expect(panes.map(pane => pane.element.offsetWidth)).toEqual([100, 100, 100]);
    });
    it('should preserve sizes and clear drag sizes when pane is runtime collapsed.', () => {
        const panes = splitter.panes.toArray();
        panes[0].size = '70%';
        panes[1].size = '20%';
        panes[2].size = '10%';
        panes[0].dragSize = '60%';
        panes[2].dragSize = '5%';
        fixture.detectChanges();
        panes[1].collapsed = true;
        fixture.detectChanges();
        expect(panes.map(pane => pane.size)).toEqual(['70%', '20%', '10%']);
        expect(panes[0].dragSize).toBeNull();
        expect(panes[2].dragSize).toBeNull();
    });
});

describe('IgxSplitter resizing with minSize and browser window is shrinked', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SplitterMinSiezComponent
            ]
        }).compileComponents();
    });

    let fixture;
    let splitter;
    beforeEach(async () => {
        fixture = TestBed.createComponent(SplitterMinSiezComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    });

    it('should set the correct sizes when the user drags one pane to the end of another', () => {
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        const minSize = parseInt(pane1.minSize);
        vi.spyOn(splitter, 'onMoveEnd');

        splitterBarComponent.moveStart.emit(pane1);
        fixture.detectChanges();
        splitterBarComponent.movingEnd.emit(splitter.getTotalSize() - minSize);
        fixture.detectChanges();

        splitter.elementRef.nativeElement.style.width = '500px';
        fixture.detectChanges();

        splitterBarComponent.moveStart.emit(pane1);
        fixture.detectChanges();
        splitterBarComponent.movingEnd.emit(-200);
        fixture.detectChanges();

        expect(splitter.onMoveEnd).toHaveBeenCalled();
        expect(pane1.size).toEqual('80%');
        expect(pane2.size).toEqual('100px');
    });
});

describe('Zoneless IgxSplitter', () => {
    let fixture: ComponentFixture<SplitterTestComponent>;
    let splitter: IgxSplitterComponent;
    beforeEach(async () => {
        TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [
                SplitterTestComponent
            ],
            providers: [
                provideZonelessChangeDetection()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SplitterTestComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    });

    it('should position splitter handle correctly', () => {
        expect(splitter.panes.length).toBe(2);
        const firstPane = splitter.panes.toArray()[0].element;
        const secondPane = splitter.panes.toArray()[1].element;
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        expect(firstPane.style.order).toBe('0');
        expect(splitterBar.style.order).toBe('1');
        expect(secondPane.style.order).toBe('2');
    });
});

@Component({
    template: `
    <igx-splitter>
    <igx-splitter-pane minSize="200px">
        <div>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane size="200px">
        <div>
            Pane 2
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterMinSiezComponent {
    @ViewChild(IgxSplitterComponent, { static: true })
    public splitter: IgxSplitterComponent;
}

@Component({
    template: `
    <igx-splitter [type]="type">
    <igx-splitter-pane>
        <div style='height:200px;'>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane>
        <div style='height:200px;'>
            Pane 2
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterTestComponent {
    @ViewChild(IgxSplitterComponent, { static: true })
    public splitter: IgxSplitterComponent;
    public type = SplitterType.Horizontal;
}

@Component({
    template: `
    <igx-splitter [type]="type">
    <igx-splitter-pane>
        <div style='height:200px;'>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane>
        <div style='height:200px;'>
            Pane 2
         </div>
    </igx-splitter-pane>
    <igx-splitter-pane>
        <div style='height:200px;'>
            Pane 3
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})

export class SplitterTogglePaneComponent extends SplitterTestComponent {
}

@Component({
    template: `
    <igx-splitter [type]="type" [style.width]="splitterWidth">
    <igx-splitter-pane [size]="paneSizes[0]" [minSize]="paneMinSizes[0]" [maxSize]="paneMaxSizes[0]">
         <div>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane [size]="paneSizes[1]" [minSize]="paneMinSizes[1]" [maxSize]="paneMaxSizes[1]">
        <div>
            Pane 2
         </div>
    </igx-splitter-pane>
    <igx-splitter-pane [size]="paneSizes[2]" [minSize]="paneMinSizes[2]" [maxSize]="paneMaxSizes[2]" [collapsed]='true'>
        <div>
            Pane 3
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterCollapsedPaneComponent extends SplitterTestComponent {
    public paneSizes = ['30%', '30%', '30%'];
    public paneMinSizes = ['10%', '20%', '5%'];
    public paneMaxSizes = ['40%', '50%', '35%'];
    public splitterWidth: string;
}

@Component({
    template: `
<igx-splitter>
    @for (number of numbers; track number) {
    <igx-splitter-pane>
      <p>{{ number }}</p>
    </igx-splitter-pane>
    }
  </igx-splitter>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterForOfPanesComponent extends SplitterTestComponent {
    public numbers = [1, 2, 3];
}
