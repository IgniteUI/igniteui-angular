// Directives
// Note: Autocomplete moved to drop-down entry point in v21.0.0
// Users should now import from 'igniteui-angular/drop-down' instead
// Removed re-export to avoid circular dependency
export * from './directives/button/button.directive';
export * from './directives/divider/divider.directive';
export * from './directives/drag-drop/public_api';
export * from './directives/filter/filter.directive';
export * from './directives/focus/focus.directive';
export * from './directives/focus-trap/focus-trap.directive';
export {
    IForOfDataChangeEventArgs,
    IForOfDataChangingEventArgs,
    IForOfState,
    IgxForOfContext,
    IgxForOfDirective,
    IgxGridForOfContext,
    IgxGridForOfDirective,
    IgxForOfToken
} from './directives/for-of/for_of.directive';
export { IgxForOfSyncService, IgxForOfScrollSyncService } from './directives/for-of/for_of.sync.service';
export * from './directives/button/icon-button.directive';
export * from './directives/layout/layout.directive';
export * from './directives/mask/mask.directive';
// Note: Radio-group directive moved to radio entry point in v21.0.0
// Users should now import from 'igniteui-angular/radio' instead
// export { IgxRadioGroupDirective, IChangeRadioEventArgs } from 'igniteui-angular/radio';
export * from './directives/ripple/ripple.directive';
export * from './directives/scroll-inertia/scroll_inertia.directive';
export * from './directives/size/ig-size.directive';
export * from './directives/text-highlight/text-highlight.directive';
export * from './directives/text-selection/text-selection.directive';
export * from './directives/template-outlet/template_outlet.directive';
export * from './directives/toggle/toggle.directive';
export * from './directives/tooltip/public_api';
export * from './directives/date-time-editor/public_api';
export * from './directives/form-control/form-control.directive';
export * from './directives/notification/notifications.directive';
export * from './directives/text-highlight/text-highlight.service';

// NOTE: Input-related directives (IgxHintDirective, IgxInputDirective, IgxLabelDirective,
// IgxPrefixDirective, IgxSuffixDirective, IgxReadonlyInputDirective) have been moved
// to igniteui-angular/input-group entry point.
// Import them from 'igniteui-angular/input-group' instead of 'igniteui-angular/directives'

// Directive modules for backwards compatibility
export * from './directives/button/button.module';
export * from './directives/date-time-editor/date-time-editor.module';
export * from './directives/divider/divider.module';
export * from './directives/drag-drop/drag-drop.module';
export * from './directives/filter/filter.module';
export * from './directives/focus/focus.module';
export * from './directives/focus-trap/focus-trap.module';
export * from './directives/for-of/for_of.module';
export * from './directives/form-control/form-control.module';
export * from './directives/layout/layout.module';
export * from './directives/mask/mask.module';
// export { IgxRadioModule } from 'igniteui-angular/radio';
export * from './directives/ripple/ripple.module';
export * from './directives/scroll-inertia/scroll_inertia.module';
export * from './directives/text-highlight/text-highlight.module';
export * from './directives/text-selection/text-selection.module';
export * from './directives/toggle/toggle.module';
export * from './directives/tooltip/tooltip.module';
