import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild, DebugElement } from '@angular/core';
import { SplitterType, IgxSplitterComponent, ISplitterBarResizeEventArgs } from './splitter.component';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';

const SPLITTERBAR_CLASS = 'igx-splitter-bar';
const SPLITTERBAR_DIV_CLASS = '.igx-splitter-bar';
const SPLITTER_BAR_VERTICAL_CLASS = 'igx-splitter-bar--vertical';
const COLLAPSIBLE_CLASS = 'igx-splitter-bar--collapsible';

describe('IgxSplitter', () => {
    beforeEach(waitForAsync(() =>
        TestBed.configureTestingModule({
            imports: [
                SplitterTestComponent
            ]
        }).compileComponents()
    ));
    let fixture: ComponentFixture<SplitterTestComponent>;
    let splitter: IgxSplitterComponent;

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SplitterTestComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    }));

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
        const pane1 =  splitter.panes.toArray()[0];
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
        const pane1 =  splitter.panes.toArray()[0];
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
        const pane1 =  splitter.panes.toArray()[0];
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
        const pane1 =  splitter.panes.toArray()[0];
        pane1.resizable = false;
        fixture.detectChanges();
        const args = {cancel: false};
        splitterBarComponent.onDragStart(args);
        expect(args.cancel).toBeTruthy();
        expect(splitterBarComponent.cursor).toBe('');
    });

    it('should allow resizing with up/down arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 =  splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetHeight;
        const pane2_originalSize = pane2.element.offsetHeight;
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerEventHandlerKeyDown('ArrowUp', splitterBarComponent);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize - 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize + 10 + 'px');

        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize - 10 + 'px');

        pane2.resizable = false;
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        fixture.detectChanges();
        expect(pane1.dragSize).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.dragSize).toBe(pane2_originalSize - 10 + 'px');
    });

    it('should allow resizing with left/right arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Horizontal;
        fixture.detectChanges();
        const pane1 =  splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const pane1_originalSize = pane1.element.offsetWidth;
        const pane2_originalSize = pane2.element.offsetWidth;
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', splitterBarComponent);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize - 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize + 10, 0);

        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 10, 0);

        pane1.resizable = false;
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        fixture.detectChanges();
        expect(parseFloat(pane1.dragSize)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.dragSize)).toBeCloseTo(pane2_originalSize - 10, 0);
    });

    it('should allow expand/collapse with Ctrl + up/down arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();
        const pane1 =  splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerEventHandlerKeyDown('ArrowUp', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeTruthy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowUp', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeFalsy();
    });

    it('should allow expand/collapse with Ctrl + left/right arrow keys', () => {
        fixture.componentInstance.type = SplitterType.Horizontal;
        fixture.detectChanges();
        const pane1 =  splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        expect(pane1.size).toBe('auto');
        expect(pane2.size).toBe('auto');
        const splitterBarComponent: DebugElement = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        splitterBarComponent.nativeElement.focus();
        UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeTruthy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane1.collapsed).toBeFalsy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeTruthy();
        UIInteractions.triggerEventHandlerKeyDown('ArrowLeft', splitterBarComponent, false, false, true);
        fixture.detectChanges();
        expect(pane2.collapsed).toBeFalsy();
    });

    it('should allow resize in % when pane size is auto.', () => {
        const pane1 =  splitter.panes.toArray()[0];
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

        expect(pane1.size.indexOf('%') !== -1).toBeTrue();
        expect(pane2.size.indexOf('%') !== -1).toBeTrue();

        expect(pane1.element.offsetWidth).toBeCloseTo(pane1_originalSize + 100);
        expect(pane2.element.offsetWidth).toBeCloseTo(pane2_originalSize - 100);
    });

    it('should allow mixing % and px sizes.', () => {
        const pane1 =  splitter.panes.toArray()[0];
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
        expect(pane2.size.indexOf('%') !== -1).toBeTrue();

        expect(pane1.element.offsetWidth).toBeCloseTo(pane1_originalSize + 100);
        expect(pane2.element.offsetWidth).toBeCloseTo(pane2_originalSize - 100);
    });

    it('should reset transform style of vertical splitter bar after dragging', async () => {
        const pane1 =  splitter.panes.toArray()[0];
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
    beforeEach(waitForAsync(() => TestBed.configureTestingModule({
        imports: [
            SplitterTogglePaneComponent
        ]
    }).compileComponents()));

    let fixture; let splitter;
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SplitterTogglePaneComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
        fixture.detectChanges();
    }));

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
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponentDebug);
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
        spyOn(splitter.resizeStart, 'emit').and.callThrough();
        spyOn(splitter.resizing, 'emit').and.callThrough();
        spyOn(splitter.resizeEnd, 'emit').and.callThrough();

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
    beforeEach(waitForAsync(() => TestBed.configureTestingModule({
        imports: [
            SplitterCollapsedPaneComponent
        ]
    }).compileComponents()));

    let fixture; let splitter;
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SplitterCollapsedPaneComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    }));

    it('should reset sizes when pane is initially collapsed.', () => {
        const panes = splitter.panes.toArray();
        panes.forEach(pane => {
            expect(pane.size).toBe('auto');
        });
    });
    it('should reset sizes when pane is runtime collapsed.', () => {
        const panes = splitter.panes.toArray();
        panes[0].size = '70%';
        fixture.detectChanges();
        panes[1].collapsed = true;
        fixture.detectChanges();
        panes.forEach(pane => {
            expect(pane.size).toBe('auto');
        });
    });
});

describe('IgxSplitter resizing with minSize and browser window is shrinked', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                SplitterMinSiezComponent
            ]
        }).compileComponents();
    }));

    let fixture; let splitter;
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SplitterMinSiezComponent);
        fixture.detectChanges();
        splitter = fixture.componentInstance.splitter;
    }));

    it('should set the correct sizes when the user drags one pane to the end of another', () => {
        const pane1 = splitter.panes.toArray()[0];
        const pane2 = splitter.panes.toArray()[1];
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        const minSize = parseInt(pane1.minSize);
        spyOn(splitter, 'onMoveEnd').and.callThrough();

        pane1.size = (splitter.getTotalSize() - parseInt(pane2.size)) + 'px';
        fixture.detectChanges();

        splitterBarComponent.moveStart.emit(pane1);
        fixture.detectChanges();
        splitterBarComponent.movingEnd.emit(splitter.getTotalSize() -minSize);
        fixture.detectChanges();

        splitter.elementRef.nativeElement.style.width = '500px';
        pane2.size = (splitter.getTotalSize() - minSize) + 'px';
        fixture.detectChanges();

        splitterBarComponent.moveStart.emit(pane1);
        fixture.detectChanges();
        splitterBarComponent.movingEnd.emit(-400);
        fixture.detectChanges();

        const isFullSize = pane1.size === '100%' || pane1.size === (splitter.getTotalSize() + 'px');

        expect(splitter.onMoveEnd).toHaveBeenCalled();
        expect(isFullSize).toBeTruthy();
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
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})

export class SplitterTogglePaneComponent extends SplitterTestComponent {
}

@Component({
    template: `
    <igx-splitter [type]="type">
    <igx-splitter-pane size='30%'>
         <div>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane size='30%'>
        <div>
            Pane 2
         </div>
    </igx-splitter-pane>
    <igx-splitter-pane size='30%' [collapsed]='true'>
        <div>
            Pane 3
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterCollapsedPaneComponent extends SplitterTestComponent {
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
    imports: [IgxSplitterComponent, IgxSplitterPaneComponent]
})
export class SplitterForOfPanesComponent extends SplitterTestComponent {
    public numbers = [1, 2, 3];
}
