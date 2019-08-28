import { DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import {
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxStringFilteringOperand
} from '../../data-operations/filtering-condition';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { changei18n, getCurrentResourceStrings } from '../../core/i18n/resources';
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { IgxChipComponent } from '../../chips/chip.component';
import { DisplayDensity } from '../../core/density';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import {
    IgxGridFilteringComponent, IgxGridAdvancedFilteringComponent
} from '../../test-utils/grid-samples.spec';
import { HelperUtils, resizeObserverIgnoreError } from '../../test-utils/helper-utils.spec';

/* const strings go here */

describe('IgxGrid - Advanced Filtering', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridAdvancedFilteringComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('', () => {
        let fix, grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            resizeObserverIgnoreError();
            fix = TestBed.createComponent(IgxGridAdvancedFilteringComponent);
            grid = fix.componentInstance.grid;
            fix.detectChanges();
        }));

        it('Should correctly initialize the Advanced Filtering dialog.',
        fakeAsync(() => {
            // Open Advanced Filtering dialog.
            const advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
            advFilterButton.click();
            fix.detectChanges();

            // Verify AF dialog is opened.
            let advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
            expect(advFilterDialog).not.toBeNull();

            // Verify there are not filters present and that the default text is shown.
            const filterTrees = GridFunctions.getAdvancedFilteringAllFilterTrees(fix);
            expect(filterTrees.length).toBe(0);
            expect(grid.crossFieldFilteringExpressionsTree).toBeUndefined();
            expect(GridFunctions.getAdvancedFilteringEmptyPrompt(fix)).not.toBeNull();

            // Close Advanced Filtering dialog.
            const cancelButton = GridFunctions.getAdvancedFilteringCancelButton(fix);
            cancelButton.click();
            tick(200);
            fix.detectChanges();

            // Verify AF dialog is closed.
            advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
            expect(advFilterDialog).toBeNull();
        }));
    });
});
