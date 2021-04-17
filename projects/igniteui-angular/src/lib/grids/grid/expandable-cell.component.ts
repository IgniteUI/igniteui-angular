import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    NgZone,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { GridBaseAPIService } from '../api.service';
import { PlatformUtil } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseDirective } from './public_api';
import { IgxGridSelectionService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { GridType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-expandable-grid-cell',
    templateUrl: 'expandable-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxGridExpandableCellComponent extends IgxGridCellComponent implements OnInit {
    /**
     * @hidden
     */
    @Input()
    public expanded = false;

    @ViewChild('indicator', { read: ElementRef })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef })
    public indentationDiv: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    constructor(selectionService: IgxGridSelectionService,
                gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                protected zone: NgZone,
                touchManager: HammerGesturesManager,
                @Inject(DOCUMENT) public document,
                protected platformUtil: PlatformUtil) {
        super(selectionService, gridAPI, cdr, element, zone, touchManager, platformUtil);
    }

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        const expansionState = this.gridAPI.get_row_expansion_state(this.intRow.rowData);
        this.gridAPI.set_row_expansion_state(this.intRow.rowID, !expansionState, event);
    }

    /**
     * @hidden
     */
    public onIndicatorFocus(event) {
        this.gridAPI.submit_value(event);
    }

    /**
     * @hidden
     */
    public get iconTemplate() {
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        }
    }

    /**
     * @hidden
     */
    public get showExpanderIndicator() {
        const isGhost = this.intRow.pinned && this.intRow.disabled;
        return !this.editMode && (!this.intRow.pinned || isGhost);
    }
}
