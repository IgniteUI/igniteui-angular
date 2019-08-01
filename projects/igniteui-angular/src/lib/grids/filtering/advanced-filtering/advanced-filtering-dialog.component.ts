import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { PositionSettings, VerticalAlignment, HorizontalAlignment, OverlaySettings } from '../../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { AbsoluteScrollStrategy } from '../../../services/overlay/scroll/absolute-scroll-strategy';
import { IgxFilteringService } from '../grid-filtering.service';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { DisplayDensity } from '../../../core/displayDensity';
import { IgxToggleDirective } from 'igniteui-angular';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-advanced-filtering-dialog',
    templateUrl: './advanced-filtering-dialog.component.html'
})
export class IgxAdvancedFilteringDialogComponent implements AfterViewInit {
    private _customDialogPositionSettings: PositionSettings = {
        verticalDirection: VerticalAlignment.Middle,
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    private _customDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._customDialogPositionSettings),
        scrollStrategy: new AbsoluteScrollStrategy()
    };

    @Input()
    public filteringService: IgxFilteringService;

    @Input()
    public overlayComponentId: string;

    @Input()
    public overlayService: IgxOverlayService;

    @Input()
    public displayDensity: DisplayDensity;

    ngAfterViewInit(): void {
        this._customDialogOverlaySettings.outlet = this.grid.outlet;
    }

    get grid(): any {
        return this.filteringService.grid;
    }

    public initialize(filteringService: IgxFilteringService, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.filteringService = filteringService;
        this.overlayService = overlayService;
        this.overlayComponentId = overlayComponentId;

        // this._subMenuOverlaySettings.outlet = this.grid.outlet;
    }

    public onClearButtonClick() {
        // this.filteringService.clearFilter();
        // this.createInitialExpressionUIElement();
        // this.cdr.detectChanges();
    }

    public closeDialog() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
        }
    }

    public onApplyButtonClick() {
        // this.expressionsList = this.expressionsList.filter(
        //     element => element.expression.condition &&
        //     (element.expression.searchVal || element.expression.searchVal === 0 || element.expression.condition.isUnary));

        // if (this.expressionsList.length > 0) {
        //     this.expressionsList[0].beforeOperator = null;
        //     this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        // }

        // this.filteringService.filterInternal(this.column.field, this.expressionsList);
        this.closeDialog();
    }
}
