/*
 * Public API Surface of igniteui-angular
 */

/**
 * Animations
 * MOVED TO igniteui-angular/animations
 */
//export * from './lib/animations/main';

/**
 * Directives
 */
export * from './lib/core/navigation';
export * from './lib/directives/autocomplete/autocomplete.directive';
export * from './lib/directives/button/button.directive';
export * from './lib/directives/divider/divider.directive';
export * from './lib/directives/drag-drop/public_api';
export * from './lib/directives/filter/filter.directive';
export * from './lib/directives/focus/focus.directive';
export * from './lib/directives/focus-trap/focus-trap.directive';
export {
    IgxForOfContext, IgxForOfDirective, IForOfState, IgxGridForOfContext, IgxGridForOfDirective
} from './lib/directives/for-of/for_of.directive';
export * from './lib/directives/button/icon-button.directive';
export * from './lib/directives/layout/layout.directive';
export * from './lib/directives/mask/mask.directive';
export * from './lib/directives/radio/public_api';
export * from './lib/directives/ripple/ripple.directive';
export * from './lib/directives/scroll-inertia/scroll_inertia.directive';
export * from './lib/directives/size/ig-size.directive';
export * from './lib/directives/text-highlight/text-highlight.directive';
export * from './lib/directives/text-selection/text-selection.directive';
export * from './lib/directives/template-outlet/template_outlet.directive';
export * from './lib/directives/toggle/toggle.directive';
export * from './lib/directives/tooltip/public_api';
export * from './lib/directives/date-time-editor/public_api';
export * from './lib/directives/form-control/form-control.directive';

/**
 * Data operations
 */
export * from './lib/data-operations/data-clone-strategy';
export * from './lib/data-operations/filtering-expression.interface';
export * from './lib/data-operations/filtering-expressions-tree';
export * from './lib/data-operations/filtering-condition';
export * from './lib/data-operations/filtering-state.interface';
export * from './lib/data-operations/filtering-strategy';
export * from './lib/data-operations/expressions-tree-util';
export * from './lib/data-operations/groupby-expand-state.interface';
export * from './lib/data-operations/groupby-record.interface';
export * from './lib/data-operations/groupby-state.interface';
export * from './lib/data-operations/grouping-expression.interface';
export * from './lib/data-operations/sorting-strategy';
export * from './lib/data-operations/paging-state.interface';
export * from './lib/data-operations/data-util';

/**
 * Components
 */
export * from './lib/accordion/public_api';
export * from './lib/action-strip/public_api';
export * from './lib/avatar/avatar.component';
export * from './lib/badge/badge.component';
export * from './lib/banner/public_api';
export * from './lib/buttonGroup/public_api';
export * from './lib/calendar/public_api';
export * from './lib/card/public_api';
export * from './lib/carousel/public_api';
export * from './lib/checkbox/public_api';
export * from './lib/chips/public_api';
export * from './lib/combo/public_api';
export * from './lib/simple-combo/public_api';
export * from './lib/date-picker/public_api';
export * from './lib/dialog/public_api';
export * from './lib/drop-down/public_api';
export * from './lib/grids/public_api';
export * from './lib/grids/grid/public_api';
export * from './lib/grids/pivot-grid/public_api';
export * from './lib/grids/tree-grid/public_api';
export * from './lib/grids/hierarchical-grid/public_api';
export * from './lib/icon/public_api';
export * from './lib/input-group/public_api';
export * from './lib/list/public_api';
export * from './lib/expansion-panel/public_api';
export * from './lib/navbar/public_api';
export * from './lib/navigation-drawer/public_api';
export * from './lib/paginator/public_api';
export * from './lib/progressbar/public_api';
export * from './lib/radio/radio.component';
export * from './lib/slider/public_api';
export * from './lib/snackbar/snackbar.component';
export * from './lib/switch/switch.component';
export * from './lib/tabs/bottom-nav/public_api';
export * from './lib/tabs/tabs/public_api';
export * from './lib/time-picker/public_api';
export * from './lib/toast/toast.component';
export * from './lib/select/public_api';
export * from './lib/splitter/public_api';
export * from './lib/stepper/public_api';
export * from './lib/date-range-picker/public_api';
export * from './lib/date-common/public_api';
export * from './lib/tree/public_api';
export * from './lib/query-builder/public_api';

/**
 * Exporter services, classes, interfaces and enums
 */
export * from './lib/services/public_api';
export * from './lib/core/dates';
export { PickerInteractionMode } from './lib/date-common/types';
export { GridSelectionRange } from './lib/grids/common/types';
export { CancelableEventArgs, CancelableBrowserEventArgs } from './lib/core/utils';

/**
 * i18n
 */
export { igxI18N, IResourceStrings, changei18n } from './lib/core/i18n/resources';
export { ICarouselResourceStrings, CarouselResourceStringsEN } from './lib/core/i18n/carousel-resources';
export { IGridResourceStrings, GridResourceStringsEN } from './lib/core/i18n/grid-resources';
export { IComboResourceStrings, ComboResourceStringsEN } from './lib/core/i18n/combo-resources';
export { IPaginatorResourceStrings, PaginatorResourceStringsEN } from './lib/core/i18n/paginator-resources';
export { ICalendarResourceStrings, CalendarResourceStringsEN } from './lib/core/i18n/calendar-resources';
export { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './lib/core/i18n/time-picker-resources';
export { IDatePickerResourceStrings, DatePickerResourceStringsEN } from './lib/core/i18n/date-picker-resources';
export { IDateRangePickerResourceStrings, DateRangePickerResourceStringsEN } from './lib/core/i18n/date-range-picker-resources';
export { IListResourceStrings, ListResourceStringsEN } from './lib/core/i18n/list-resources';
export { ITreeResourceStrings, TreeResourceStringsEN } from './lib/core/i18n/tree-resources';
export { IInputResourceStrings, InputResourceStringsEN } from './lib/core/i18n/input-resources';
export { IChipResourceStrings, ChipResourceStringsEN } from './lib/core/i18n/chip-resources';
export { IActionStripResourceStrings, ActionStripResourceStringsEN } from './lib/core/i18n/action-strip-resources';
export { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from './lib/core/i18n/query-builder-resources';
export { IBannerResourceStrings, BannerResourceStringsEN } from './lib/core/i18n/banner-resources';

/* IMPORTANT: The following are NgModules exported for backwards-compatibility before standalone components */
export * from './lib/accordion/accordion.module';
export * from './lib/action-strip/action-strip.module';
export * from './lib/avatar/avatar.module';
export * from './lib/badge/badge.module';
export * from './lib/banner/banner.module';
export * from './lib/buttonGroup/buttongroup.module';
export * from './lib/calendar/calendar.module';
export * from './lib/card/card.module';
export * from './lib/carousel/carousel.module';
export * from './lib/checkbox/checkbox.module';
export * from './lib/chips/chips.module';
export * from './lib/combo/combo.module';
export * from './lib/date-picker/date-picker.module';
export * from './lib/date-range-picker/date-range-picker.module';
export * from './lib/dialog/dialog.module';
export * from './lib/directives/autocomplete/autocomplete.module';
export * from './lib/directives/button/button.module';
export * from './lib/directives/date-time-editor/date-time-editor.module';
export * from './lib/directives/divider/divider.module';
export * from './lib/directives/drag-drop/drag-drop.module';
export * from './lib/directives/filter/filter.module';
export * from './lib/directives/focus/focus.module';
export * from './lib/directives/focus-trap/focus-trap.module';
export * from './lib/directives/for-of/for_of.module';
export * from './lib/directives/form-control/form-control.module';
export * from './lib/directives/layout/layout.module';
export * from './lib/directives/mask/mask.module';
export * from './lib/directives/radio/radio-group.module';
export * from './lib/directives/ripple/ripple.module';
export * from './lib/directives/scroll-inertia/scroll_inertia.module';
export * from './lib/directives/text-highlight/text-highlight.module';
export * from './lib/directives/text-selection/text-selection.module';
export * from './lib/directives/toggle/toggle.module';
export * from './lib/directives/tooltip/tooltip.module';
export * from './lib/drop-down/drop-down.module';
export * from './lib/expansion-panel/expansion-panel.module';
export * from './lib/grids/grid/grid.module';
export * from './lib/grids/tree-grid/tree-grid.module';
export * from './lib/grids/hierarchical-grid/hierarchical-grid.module';
export * from './lib/grids/pivot-grid/pivot-grid.module';
export * from './lib/icon/icon.module';
export * from './lib/input-group/input-group.module';
export * from './lib/list/list.module';
export * from './lib/navbar/navbar.module';
export * from './lib/navigation-drawer/navigation-drawer.module';
export * from './lib/paginator/paginator.module';
export * from './lib/progressbar/progressbar.module';
export * from './lib/query-builder/query-builder.module';
export * from './lib/select/select.module';
export * from './lib/simple-combo/simple-combo.module';
export * from './lib/slider/slider.module';
export * from './lib/snackbar/snackbar.module';
export * from './lib/splitter/splitter.module';
export * from './lib/stepper/stepper.module';
export * from './lib/switch/switch.module';
export * from './lib/tabs/bottom-nav/bottom-nav.module';
export * from './lib/tabs/tabs/tabs.module';
export * from './lib/time-picker/time-picker.module';
export * from './lib/toast/toast.module';
export * from './lib/tree/tree.module';
