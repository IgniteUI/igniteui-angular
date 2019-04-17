import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, async } from '@angular/core/testing';
import { IgxGridComponent } from './grid.component';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './grid.module';

describe('IgxGrid - Row Drag', () => {
    configureTestSuite();
    // let fixture, grid: IgxGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [

            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                IgxGridModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('', () => {
        configureTestSuite();

        it('Start dragging and check ghost', (async () => {

            /*const row: DebugElement[] = fixture.debugElement.queryAll(By.css(ROW));
            UIInteractions.simulatePointerEvent('pointerdown', row, 450, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', row, 455, 81);
            await wait(50);
            UIInteractions.simulatePointerEvent('pointermove', row, 100, 75);
            await wait();
            UIInteractions.simulatePointerEvent('pointerup', row, 100, 75);
            await wait();
            fixture.detectChanges();*/

        }));

        it('Start dragging programmatically using API.', (async () => {


        }));

        it('Should cancel dragging when ESCAPE key is pressed.', (async() => {

        }));

        it('Scroll start should be correctly aligned with first column and not with drag indicator ', (async() => {
            // Test if drag indicator width = 0
        }));

        it('Should fire onDragStart and onDragEnd with correct values of event arguments.', (async() => {

        }));

        it('Should be able to cancel onColumnMoving event.', (async() => {

        }));

        it('Multi-row layout integration.', (async() => {

        }));

    });
});
