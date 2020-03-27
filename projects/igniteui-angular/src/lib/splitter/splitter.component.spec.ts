import { IgxSplitterModule } from './splitter.module';
import { configureTestSuite } from '../test-utils/configure-suite';
import { TestBed, async } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { SplitterType, IgxSplitterComponent } from './splitter.component';

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
        splitter = fixture.componentInstance.snackbar;
    }));

    it('should render pane content correctly in splitter.', () => {});
    it('should render vertical splitter.', () => {});
    it('should render horizontal splitter.', () => {});
    it('should allow resizing vertical splitter via drag', () => {});
    it('should allow resizing horizontal splitter via drag', () => {});
    it('should honor minSize/maxSize when resizing.', () => {});

});

@Component({
    template: `
    <igx-splitter [type]="type">
    <igx-splitter-pane>
        <div>
           Pane 1
        </div>
    </igx-splitter-pane>
    <igx-splitter-pane>
        <div>
            Pane 2
         </div>
    </igx-splitter-pane>
</igx-splitter>
    `,
})
export class SplitterTestComponent {
    type = SplitterType.Vertical;
    @ViewChild(IgxSplitterComponent, { static: true })
    public splitter: IgxSplitterComponent;
}
