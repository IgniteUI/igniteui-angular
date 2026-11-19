import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    booleanAttribute,
    inject,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { pinLeft, unpinLeft } from '@igniteui/material-icons-extended';
import { IgxGridToolbarActionsComponent } from './common';
import { GridServiceType, GridType, IGX_GRID_SERVICE_BASE } from '../common/grid.interface';
import { IgxToolbarToken } from './token';
import { IgxGridToolbarAdvancedFilteringComponent } from './grid-toolbar-advanced-filtering.component';
import { NgTemplateOutlet } from '@angular/common';
import { IgxLinearProgressBarComponent } from 'igniteui-angular/progressbar';
import { IgxIconService } from 'igniteui-angular/icon';

/* blazorElement */
/* mustUseNGParentAnchor */
/* wcElementTag: igc-grid-toolbar */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: Grid */
/* contentParent: TreeGrid */
/* contentParent: RowIsland */
/* contentParent: HierarchicalGrid */
/* jsonAPIManageItemInMarkup */
/**
 * Provides a context-aware container component for UI operations for the grid components.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridComponent, IgxHierarchicalGridComponent, IgxTreeGridComponent, IgxPivotGridComponent,
 *
 */
@Component({
    selector: 'igx-grid-toolbar',
    templateUrl: './grid-toolbar.component.html',
    styleUrl: 'grid-toolbar.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxToolbarToken, useExisting: IgxGridToolbarComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridToolbarActionsComponent, IgxGridToolbarAdvancedFilteringComponent, NgTemplateOutlet, IgxLinearProgressBarComponent]
})
export class IgxGridToolbarComponent implements OnDestroy {
    private api = inject<GridServiceType>(IGX_GRID_SERVICE_BASE);
    private iconService = inject(IgxIconService);
    private element = inject<ElementRef<HTMLElement>>(ElementRef);


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
     * Gets the grid component the toolbar belongs to.
     *
     * @remarks
     * The grid is resolved automatically from the toolbar's context, including
     * hierarchical child grids.
     *
     * @returns The grid component instance that owns the toolbar.
     * @example
     * ```typescript
     * const grid = this.toolbar.grid;
     * ```
     */
    public get grid(): GridType {
        return this.api.grid;
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
    public hasActions!: IgxGridToolbarActionsComponent;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar')
    public defaultStyle = true;

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.role')
    public role = 'presentation';

    protected sub!: Subscription;

    constructor() {
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons', true);
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons', true);
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
