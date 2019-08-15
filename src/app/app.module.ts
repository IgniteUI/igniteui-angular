import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
    IgxIconModule, IgxGridModule, IgxExcelExporterService, IgxCsvExporterService, IgxOverlayService,
    IgxGridTransaction, IgxTransactionService, IgxTreeGridModule,  IgxHierarchicalGridModule, IgxInputGroupModule, IgxIconService} from 'igniteui-angular';
import { IgxColumnHidingModule } from 'igniteui-angular';
import { SharedModule } from './shared/shared.module';
import { IgxDragDropModule } from '../../projects/igniteui-angular/src/lib/directives/drag-drop/drag-drop.directive';
import { IgxDividerModule } from '../../projects/igniteui-angular/src/lib/directives/divider/divider.directive';

import { routing } from './routing';
import { AppComponent } from './app.component';
import { AvatartSampleComponent } from './avatar/avatar.sample';
import { PageHeaderComponent } from './pageHeading/pageHeading.component';
import { BadgeSampleComponent } from './badge/badge.sample';
import { ButtonSampleComponent } from './button/button.sample';
import { CalendarSampleComponent } from './calendar/calendar.sample';
import { CardSampleComponent } from './card/card.sample';
import { CarouselSampleComponent } from './carousel/carousel.sample';
import { ChipsSampleComponent } from './chips/chips.sample';
import { DatePickerSampleComponent } from './date-picker/date-picker.sample';
import { DialogSampleComponent } from './dialog/dialog.sample';
import { DragDropSampleComponent } from './drag-drop/drag-drop.sample';
import { MaskSampleComponent, DisplayFormatPipe, InputFormatPipe } from './mask/mask.sample';
import { IconSampleComponent } from './icon/icon.sample';
import { InputSampleComponent } from './input/input.sample';
import { InputGroupSampleComponent } from './input-group/input-group.sample';
import { InputGroupChildSampleComponent } from './input-group/input-group-child.sample';
import { LayoutSampleComponent } from './layout/layout.sample';
import { ListSampleComponent } from './list/list.sample';
import { ListPanningSampleComponent } from './list-panning/list-panning.sample';
import { ListPerformanceSampleComponent } from './list-performance/list-performance.sample';
import { NavbarSampleComponent } from './navbar/navbar.sample';
import { NavdrawerSampleComponent } from './navdrawer/navdrawer.sample';
import { ProgressbarSampleComponent } from './progressbar/progressbar.sample';
import { RippleSampleComponent } from './ripple/ripple.sample';
import { SliderSampleComponent } from './slider/slider.sample';
import { SnackbarSampleComponent } from './snackbar/snackbar.sample';
import { ColorsSampleComponent } from './styleguide/colors/color.sample';
import { ShadowsSampleComponent } from './styleguide/shadows/shadows.sample';
import { TypographySampleComponent } from './styleguide/typography/typography.sample';
import { BottomNavSampleComponent, CustomContentComponent } from './bottomnav/bottomnav.sample';
import { BottomNavRoutingSampleComponent } from './bottomnav-routing/bottomnav-routing.sample';
import {
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component } from './bottomnav-routing/bottomnav-routing-views.sample';
import { TabsSampleComponent } from './tabs/tabs.sample';
import { TabsRoutingSampleComponent } from './tabs-routing/tabs-routing.sample';
import {
    TabsRoutingView1Component,
    TabsRoutingView2Component,
    TabsRoutingView3Component } from './tabs-routing/tabs-routing-views.sample';
import { TimePickerSampleComponent } from './time-picker/time-picker.sample';
import { ToastSampleComponent } from './toast/toast.sample';
import { RemoteService } from './shared/remote.service';
import { VirtualForSampleComponent } from './virtual-for-directive/virtual-for.sample';
import { LocalService } from './shared/local.service';
import { GridCellEditingComponent } from './grid-cellEditing/grid-cellEditing.component';
import { GridSampleComponent } from './grid/grid.sample';
import { GridColumnMovingSampleComponent } from './grid-column-moving/grid-column-moving.sample';
import { GridColumnPinningSampleComponent } from './grid-column-pinning/grid-column-pinning.sample';
import { GridColumnResizingSampleComponent } from './grid-column-resizing/grid-column-resizing.sample';
import { GridSummaryComponent } from './grid-summaries/grid-summaries.sample';
import { GridPerformanceSampleComponent } from './grid-performance/grid-performance.sample';
import { GridSelectionComponent } from './grid-selection/grid-selection.sample';
import { GridRowDraggableComponent } from './grid-row-draggable/grid-row-draggable.sample';
import { GridToolbarSampleComponent } from './grid-toolbar/grid-toolbar.sample';
import { GridToolbarCustomSampleComponent } from './grid-toolbar/grid-toolbar-custom.sample';
import { GridVirtualizationSampleComponent } from './grid-remote-virtualization/grid-remote-virtualization.sample';
import { ButtonGroupSampleComponent } from './buttonGroup/buttonGroup.sample';
import { GridColumnGroupsSampleComponent } from './grid-column-groups/grid-column-groups.sample';
import { GridCellStylingSampleComponent } from './gird-cell-styling/grid-cell-styling.sample';
import { GridGroupBySampleComponent } from './grid-groupby/grid-groupby.sample';
import { DropDownSampleComponent } from './drop-down/drop-down.sample';
import { DisplayDensityDropDownComponent } from './drop-down/display-density/display-density.sample';
import { DropDownVirtualComponent } from './drop-down/drop-down-virtual/drop-down-virtual.component';
import { ComboSampleComponent } from './combo/combo.sample';
import { OverlaySampleComponent } from './overlay/overlay.sample';
import { OverlayAnimationSampleComponent } from './overlay/overlay-animation.sample';
import { RadioSampleComponent } from './radio/radio.sample';
import { TooltipSampleComponent } from './tooltip/tooltip.sample';
import { ExpansionPanelSampleComponent } from './expansion-panel/expansion-panel-sample';
import { DisplayDensityToken, DisplayDensity } from 'projects/igniteui-angular/src/lib/core/displayDensity';
import { GridRowEditSampleComponent } from './grid-row-edit/grid-row-edit-sample.component';
import { GridWithTransactionsComponent } from './grid-row-edit/grid-with-transactions.component';
import { TreeGridSampleComponent } from './tree-grid/tree-grid.sample';
import { TreeGridFlatDataSampleComponent } from './tree-grid-flat-data/tree-grid-flat-data.sample';
import { HierarchicalGridSampleComponent } from './hierarchical-grid/hierarchical-grid.sample';
import { HierarchicalGridRemoteSampleComponent } from './hierarchical-grid-remote/hierarchical-grid-remote.sample';
import { HierarchicalGridUpdatingSampleComponent } from './hierarchical-grid-updating/hierarchical-grid-updating.sample';
import { GridColumnPercentageWidthsSampleComponent } from './grid-percentage-columns/grid-percantge-widths.sample';
import { BannerSampleComponent } from './banner/banner.sample';
import { TreeGridWithTransactionsComponent } from './tree-grid/tree-grid-with-transactions.component';
import { CalendarViewsSampleComponent } from './calendar-views/calendar-views.sample';
import { SelectSampleComponent } from './select/select.sample';
import { GridSearchBoxComponent } from './grid-search-box/grid-search-box.component';
import { GridSearchComponent } from './grid-search/grid-search.sample';
import { AutocompleteSampleComponent, AutocompletePipeContains, AutocompleteGroupPipeContains } from './autocomplete/autocomplete.sample';
import { GridMRLSampleComponent } from './grid-multi-row-layout/grid-mrl.sample';
import { TreeGridLoadOnDemandSampleComponent } from './tree-grid-load-on-demand/tree-grid-load-on-demand.sample';
import { GridFilterTemplateSampleComponent } from './grid-filter-template/grid-filter-template.sample';
import { GridMRLConfigSampleComponent } from './grid-multi-row-layout-config/grid-mrl-config.sample';
import { GridMRLCustomNavigationSampleComponent } from './grid-mrl-custom-navigation/grid-mrl-custom-navigation';
import { InputGroupFluentSampleComponent } from './input-group/input-group-fluent.sample';
import { GridClipboardSampleComponent } from './grid-clipboard/grid-clipboard.sample';
import { GridEsfLoadOnDemandComponent } from './grid-esf-load-on-demand/grid-esf-load-on-demand.component';




const components = [
    AppComponent,
    AutocompletePipeContains,
    AutocompleteGroupPipeContains,
    AutocompleteSampleComponent,
    AvatartSampleComponent,
    BadgeSampleComponent,
    BannerSampleComponent,
    ButtonSampleComponent,
    CalendarSampleComponent,
    CardSampleComponent,
    CarouselSampleComponent,
    ExpansionPanelSampleComponent,
    ChipsSampleComponent,
    DialogSampleComponent,
    DatePickerSampleComponent,
    DropDownSampleComponent,
    DisplayDensityDropDownComponent,
    DropDownVirtualComponent,
    DragDropSampleComponent,
    ComboSampleComponent,
    IconSampleComponent,
    InputSampleComponent,
    InputGroupSampleComponent,
    InputGroupChildSampleComponent,
    InputGroupFluentSampleComponent,
    LayoutSampleComponent,
    ListSampleComponent,
    ListPanningSampleComponent,
    ListPerformanceSampleComponent,
    MaskSampleComponent,
    NavbarSampleComponent,
    NavdrawerSampleComponent,
    OverlaySampleComponent,
    OverlayAnimationSampleComponent,
    PageHeaderComponent,
    ProgressbarSampleComponent,
    RippleSampleComponent,
    SelectSampleComponent,
    SliderSampleComponent,
    SnackbarSampleComponent,
    BottomNavSampleComponent,
    BottomNavRoutingSampleComponent,
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component,
    TabsSampleComponent,
    TabsRoutingSampleComponent,
    TabsRoutingView1Component,
    TabsRoutingView2Component,
    TabsRoutingView3Component,
    TimePickerSampleComponent,
    ToastSampleComponent,
    VirtualForSampleComponent,
    ButtonGroupSampleComponent,
    GridCellEditingComponent,
    GridSampleComponent,
    GridColumnMovingSampleComponent,
    GridColumnPinningSampleComponent,
    GridColumnResizingSampleComponent,
    GridGroupBySampleComponent,
    GridSummaryComponent,
    GridPerformanceSampleComponent,
    GridSelectionComponent,
    GridRowDraggableComponent,
    GridToolbarSampleComponent,
    GridToolbarCustomSampleComponent,
    GridVirtualizationSampleComponent,
    GridColumnGroupsSampleComponent,
    GridMRLSampleComponent,
    GridMRLConfigSampleComponent,
    GridMRLCustomNavigationSampleComponent,
    GridCellStylingSampleComponent,
    GridRowEditSampleComponent,
    GridWithTransactionsComponent,
    TreeGridSampleComponent,
    TreeGridFlatDataSampleComponent,
    TreeGridWithTransactionsComponent,
    TreeGridLoadOnDemandSampleComponent,
    CustomContentComponent,
    ColorsSampleComponent,
    ShadowsSampleComponent,
    TypographySampleComponent,
    RadioSampleComponent,
    TooltipSampleComponent,
    HierarchicalGridSampleComponent,
    HierarchicalGridRemoteSampleComponent,
    HierarchicalGridUpdatingSampleComponent,
    DisplayFormatPipe,
    InputFormatPipe,
    GridColumnPercentageWidthsSampleComponent,
    CalendarViewsSampleComponent,
    GridSearchBoxComponent,
    GridSearchComponent,
    GridFilterTemplateSampleComponent,
    GridClipboardSampleComponent,
    GridEsfLoadOnDemandComponent
];

@NgModule({
    declarations: components,
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxGridModule,
        IgxTreeGridModule,
        IgxHierarchicalGridModule,
        IgxColumnHidingModule,
        IgxDragDropModule,
        IgxDividerModule,
        SharedModule,
        routing
    ],
    providers: [
        LocalService,
        RemoteService,
        IgxExcelExporterService,
        IgxIconService,
        IgxCsvExporterService,
        IgxOverlayService,
        { provide: DisplayDensityToken, useFactory: () => ({ displayDensity: DisplayDensity.comfortable }) }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
