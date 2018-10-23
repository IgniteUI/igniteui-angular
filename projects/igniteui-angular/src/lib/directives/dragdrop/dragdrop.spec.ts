import { Component, DebugElement, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxDragDropModule, IgxDragDirective, IgxDropDirective } from './dragdrop.directive';
import { UIInteractions} from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';

@Component({
    styles: [`
        .container {
            width: 500px;
            height: 100px;
            display: flex;
            flex-flow: row;
        }
        .dragElem {
            width: 100px;
            height: 50px;
            margin: 10px;
            background-color: #66cc99;
            text-align: center;
            user-select: none;
        }
        .dropAreaStyle {
            width: 500px;
            height: 100px;
            background-color: #cccccc;
            display: flex;
            flex-flow: row;
        };
    `],
    template: `
        <h3>Draggable elements:</h3>
        <div class="container">
            <div id="firstDrag" class="dragElem" [igxDrag]="{ key: 1 }">Drag 1</div>
            <div id="secondDrag" class="dragElem" [igxDrag]="{ key: 2 }">Drag 2</div>
            <div id="thirdDrag" class="dragElem" [igxDrag]="{ key: 3 }">Drag 3</div>
        </div>
        <br/>
        <h3>Drop area:</h3>
        <div #dropArea class="dropAreaStyle" [igxDrop]="{ key: 333 }"></div>
    `
})
class TestDragDropComponent {
    @ViewChildren(IgxDragDirective)
    public dragElems: QueryList<IgxDragDirective>;

    @ViewChild('dropArea', { read: IgxDropDirective })
    public dropArea: IgxDropDirective;
}

describe('IgxDrag/IgxDrop', () => {
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestDragDropComponent
            ],
            imports: [
                FormsModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));

    it('should correctly initialize drag and drop directives', () => {
        const fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        expect(fix.componentInstance.dragElems.length).toEqual(3);
        expect(fix.componentInstance.dragElems.last.data).toEqual({ key: 3 });
        expect(fix.componentInstance.dropArea).toBeTruthy();
        expect(fix.componentInstance.dropArea.data).toEqual({ key: 333 });
    });

    it('should create drag ghost element when dragging of element starts', (done) => {
        const fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingTop = firstElement.getBoundingClientRect().top;
        const startingLeft = firstElement.getBoundingClientRect().left;
        const startingBottom = firstElement.getBoundingClientRect().bottom;
        const startingRight = firstElement.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        expect(document.getElementsByClassName('dragElem').length).toEqual(3);

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(firstDrag['_dragGhost']).toBeDefined();
            expect(firstDrag['_dragGhost'].id).toEqual('firstDrag');
            expect(firstDrag['_dragGhost'].className).toEqual('dragElem');
            expect(document.getElementsByClassName('dragElem').length).toEqual(4);

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
            UIInteractions.simulatePointerEvent('pointerup', firstDrag['_dragGhost'], startingX + 10, startingY + 10);
            expect(firstDrag['_dragGhost']).toBeNull();
            expect(document.getElementsByClassName('dragElem').length).toEqual(3);

            done();
        });
    });

    it('should throw dragStart and dragEnd events in correct order', (done) => {
        const fix = TestBed.createComponent(TestDragDropComponent);
        fix.detectChanges();

        const firstDrag = fix.componentInstance.dragElems.first;
        const firstElement = firstDrag.element.nativeElement;
        const startingTop = firstElement.getBoundingClientRect().top;
        const startingLeft = firstElement.getBoundingClientRect().left;
        const startingBottom = firstElement.getBoundingClientRect().bottom;
        const startingRight = firstElement.getBoundingClientRect().right;

        const startingX = (startingLeft + startingRight) / 2;
        const startingY = (startingTop + startingBottom) / 2;

        spyOn(firstDrag.dragStart, 'emit');
        spyOn(firstDrag.dragEnd, 'emit');

        UIInteractions.simulatePointerEvent('pointerdown', firstElement, startingX, startingY);
        fix.detectChanges();

        expect(firstDrag.dragStart.emit).not.toHaveBeenCalled();
        expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

        fix.whenStable().then(() => {
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointermove', firstElement, startingX + 10, startingY + 10);

            expect(firstDrag.dragStart.emit).toHaveBeenCalled();
            expect(firstDrag.dragEnd.emit).not.toHaveBeenCalled();

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            // We need to trigger the pointerup on the dragGhost because this is the element we move and is under the mouse
            UIInteractions.simulatePointerEvent('pointerup', firstDrag['_dragGhost'], startingX + 10, startingY + 10);

            expect(firstDrag.dragStart.emit).toHaveBeenCalled();
            expect(firstDrag.dragEnd.emit).toHaveBeenCalled();

            done();
        });
    });
});
