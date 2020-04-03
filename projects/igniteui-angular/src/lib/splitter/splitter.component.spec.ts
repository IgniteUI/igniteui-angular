import { IgxSplitterModule } from './splitter.module';
import { configureTestSuite } from '../test-utils/configure-suite';
import { TestBed, async } from '@angular/core/testing';
import { Component, ViewChild, DebugElement } from '@angular/core';
import { SplitterType, IgxSplitterComponent } from './splitter.component';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';


const SPLITTERBAR_CLASS = 'igx-splitter-bar';

describe('IgxSplitter', () => {
    configureTestSuite();
    beforeAll(async(() => {

        return TestBed.configureTestingModule({
            declarations: [ SplitterTestComponent ],
            imports: [
                IgxSplitterModule
            ]
        }).compileComponents();
    }));

    let fixture, splitter;
    beforeEach(async(() => {
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

        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).nativeElement;
        expect(firstPane.style.order).toBe('0');
        expect(splitterBar.style.order).toBe('1');
        expect(secondPane.style.order).toBe('2');
    });

    it('should render vertical splitter.', () => {
        fixture.componentInstance.type = SplitterType.Vertical;
        fixture.detectChanges();

        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        expect(splitterBar.context.direction).toBe('row');
        expect(splitterBar.context.collapseNextIcon).toBe('arrow_drop_down');
        expect(splitterBar.context.collapsePrevIcon).toBe('arrow_drop_up');
    });
    it('should render horizontal splitter.', () => {
        const splitterBar = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS));
        expect(splitterBar.context.direction).toBe('column');
        expect(splitterBar.context.collapseNextIcon).toBe('arrow_right');
        expect(splitterBar.context.collapsePrevIcon).toBe('arrow_left');
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
        expect(pane1.size).toBe(pane1_originalSize + 100 + 'px');
        expect(pane2.size).toBe(pane2_originalSize - 100 + 'px');

        splitterBarComponent.moving.emit(100);
        fixture.detectChanges();
        expect(pane1.size).toBe(pane1_originalSize - 100 + 'px');
        expect(pane2.size).toBe(pane2_originalSize + 100 + 'px');
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

        expect(parseFloat(pane1.size)).toBeCloseTo(pane1_originalSize + 100, 0);
        expect(parseFloat(pane2.size)).toBeCloseTo(pane2_originalSize - 100, 0);

        splitterBarComponent.moving.emit(100);
        fixture.detectChanges();
        expect(parseFloat(pane1.size)).toBeCloseTo(pane1_originalSize - 100, 0);
        expect(parseFloat(pane2.size)).toBeCloseTo(pane2_originalSize + 100, 0);
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
        expect(pane1.size).toBe('100px');
        expect(pane2.size).toBe('300px');

        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-200);
        splitterBarComponent.moveStart.emit(pane1);
        splitterBarComponent.moving.emit(-50);
        fixture.detectChanges();
        expect(pane1.size).toBe('300px');
        expect(pane2.size).toBe('100px');
    });

    it('should not allow drag resize if resizable is set to false.', () => {
        const pane1 =  splitter.panes.toArray()[0];
        pane1.resizable = false;
        const splitterBarComponent = fixture.debugElement.query(By.css(SPLITTERBAR_CLASS)).context;
        const args = {cancel: false};
        splitterBarComponent.onDragStart(args);
        expect(args.cancel).toBeTruthy();
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
        expect(pane1.size).toBe(pane1_originalSize - 10 + 'px');
        expect(pane2.size).toBe(pane2_originalSize + 10 + 'px');

        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        fixture.detectChanges();
        expect(pane1.size).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.size).toBe(pane2_originalSize - 10 + 'px');

        pane2.resizable = false;
        UIInteractions.triggerEventHandlerKeyDown('ArrowDown', splitterBarComponent);
        fixture.detectChanges();
        expect(pane1.size).toBe(pane1_originalSize + 10 + 'px');
        expect(pane2.size).toBe(pane2_originalSize - 10 + 'px');
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
        expect(parseFloat(pane1.size)).toBeCloseTo(pane1_originalSize - 10, 0);
        expect(parseFloat(pane2.size)).toBeCloseTo(pane2_originalSize + 10, 0);

        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        fixture.detectChanges();
        expect(parseFloat(pane1.size)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.size)).toBeCloseTo(pane2_originalSize - 10, 0);

        pane1.resizable = false;
        UIInteractions.triggerEventHandlerKeyDown('ArrowRight', splitterBarComponent);
        fixture.detectChanges();
        expect(parseFloat(pane1.size)).toBeCloseTo(pane1_originalSize + 10, 0);
        expect(parseFloat(pane2.size)).toBeCloseTo(pane2_originalSize - 10, 0);
    });

});

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
})
export class SplitterTestComponent {
    type = SplitterType.Horizontal;
    @ViewChild(IgxSplitterComponent, { static: true })
    public splitter: IgxSplitterComponent;
}
