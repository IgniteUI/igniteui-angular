import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    booleanAttribute
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IgxIconService } from '../../icon/icon.service';
import { pinLeft, unpinLeft } from '@igniteui/material-icons-extended';
import { IgxGridToolbarActionsComponent } from './common';
import { GridServiceType, GridType, IGX_GRID_SERVICE_BASE } from '../common/grid.interface';
import { IgxToolbarToken } from './token';
import { IgxLinearProgressBarComponent } from '../../progressbar/progressbar.component';
import { IgxGridToolbarAdvancedFilteringComponent } from './grid-toolbar-advanced-filtering.component';
import { NgIf, NgTemplateOutlet } from '@angular/common';

/* blazorElement */
/* mustUseNGParentAnchor */
/* wcElementTag: igc-grid-toolbar */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: GridBaseDirective */
/* contentParent: RowIsland */
/* contentParent: HierarchicalGrid */
/* jsonAPIManageItemInMarkup */
/**
 * Provides a context-aware container component for UI operations for the grid components.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent
 *
 */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html',
    providers: [{ provide: IgxToolbarToken, useExisting: IgxGridToolbarComponent }],
    imports: [NgIf, IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, NgTemplateOutlet, IgxLinearProgressBarComponent]
})
export class IgxGridToolbarComponent implements OnDestroy {

    /**
     * When enabled, shows the indeterminate progress bar.
     *
     * @remarks
     * By default this will be toggled, when the default exporter component is present
     * and an exporting is in progress.
     */
    @Input({ transform: booleanAttribute })
    public showProgress = false;

    /**
     * Gets/sets the grid component for the toolbar component.
     *
     * @deprecated since version 17.1.0. No longer required to be set for the Hierarchical Grid child grid template
     *
     * @remarks
     * Usually you should not set this property in the context of the default grid/tree grid.
     * The only grids that demands this to be set are the hierarchical child grids. For additional
     * information check the toolbar topic.
     */
    @Input()
    public get grid() {
        if (this._grid) {
            return this._grid;
        }
        return this.api.grid;
    }

    public set grid(value: GridType) {
        this._grid = value;
    }

    /** Returns the native DOM element of the toolbar component */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxGridToolbarActionsComponent)
    public hasActions: IgxGridToolbarActionsComponent;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar')
    public defaultStyle = true;

    protected _grid: GridType;
    protected sub: Subscription;

    constructor(
        @Inject(IGX_GRID_SERVICE_BASE) private api: GridServiceType,
        private iconService: IgxIconService,
        private element: ElementRef<HTMLElement>
    ) {
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
