# Ignite UI for Angular Change Log

All notable changes for each version of this project will be documented in this file.

## 5.2.0
- `igx-grid` changes
    - Data-bound Input property `filtering` changed to `filterable`:

    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>
    ```

    - @HostBinding `min-width` added to `IgxGridCellComponent` and `IgxGridHeaderCell`
    - The IgxGridCellComponent no longer has a value setter, but instead has an update(newValue) modifier.
    - Class `IgxGridFiltering` renamed to `IgxGridFilteringComponent `
    - `state` input
        - filtering epxpresstion and sortin expressions provided
    - Removed `onCellSelection` and `onRowSelection` event emitters, `onSelection` added instead.
    - Removed `onBeforeProcess` event emitter.
    - Removed `onMovingDone` event emitter.
    - Removed methods `focusCell` and `focusRow`.
    - Renamed method `filderData` to `filter`.
    - New methods `filterGlobal` and `clearFilter`.
    - New method `clearSort`.
    - Renamed method `sortColumn` to `sort`.
    - New Input `sortingIgnoreCase` - Ignore capitalization of words.
- `igx-navigation-drawer` changes
    - `IgxNavigationDrawer` renamed to `IgxNavigationDrawerComponent`
    - `IgxNavigationDirectives` renamed to `IgxNavigationModule`
    - `NavigationDrawer` renamed to `IgxNavigationDrawer`
    - `NavigationDrawerModule` renamed to `IgxNavigationDrawerModule`
    - `NavigationService` renamed to `IgxNavigationService`
    - `NavigationToggle` renamed to `IgxNavigationToggleDirective`
    - `NavigationClose` renamed to `IgxNavigationCloseDirective`
    - `IgxNavigationToggle ` renamed to `IgxNavigationToggleDirective`
    - CSS class `ig-nav-drawer-overlay` renamed to `igx-nav-drawer-overlay`
    - CSS class `ig-nav-drawer` renamed to `igx-nav-drawer`
    - CSS class `ig-drawer-mini-content` to `igx-drawer-mini-content`
    - CSS class `ig-drawer-content` to `igx-drawer-content`
    - CSS class `ig-form-group` to `igx-form-group`
- `igx-avatar` changes
    - [Initials type avatar is using SVG element from now on](https://github.com/IgniteUI/igniteui-angular/issues/136)
- `igx-calendar` changes
    - `formatViews` - Controls whether the date parts in the different calendar views should be formatted according to the provided `locale` and `formatOptions`.
    - `templating` - The **igxCalendar** supports now templating of its header and subheader parts.
    - `vertical` input - Controls the layout of the calendar component. When vertical is set to `true` the calendar header will be rendered to the side of the calendar body.
- [Renaming and restructuring directives and components](https://github.com/IgniteUI/igniteui-angular/issues/536) based on the [General Angular Naming Guidelines](https://angular.io/guide/styleguide#naming):
    - `IgxAvatar` renamed to `IgxAvatarComponent`
    - `IgxBadge` renamed to `IgxBadgeComponent`
    - `IgxButton` renamed to `IgxButtonDirective`
    - `IgxButtonGroup` renamed to `IgxButtonGroupComponent`
    - `IgxCardHeader` renamed to `IgxCardHeaderDirective`
    - `IgxCardContent` renamed to `IgxCardContentDirective`
    - `IgxCardActions` renamed to `IgxCardActionsDirective`
    - `IgxCardFooter` renamed to `IgxCardFooterDirective`
    - `IgxCarousel` renamed to `IgxCarouselComponent`
    - `IgxInput` renamed to `IgxInputModule`
    - `IgxInputClass` renamed to `IgxInputDirective`
    - `IgxCheckbox` renamed to `IgxCheckboxComponent`
    - `IgxLabel` renamed to `IgxLabelDirective`
    - `IgxIcon` renamed to `IgxIconComponent`
    - `IgxList` renamed to `IgxListComponent`
    - `IgxListItem` renamed to `IgxListItemComponent`
    - `IgxSlide` renamed to `IgxSlideComponent`
    - `IgxDialog` renamed to `IgxDialogComponent`
    - `IgxLayout` renamed to `IgxLayoutModule`
    - `IgxNavbar` renamed to `IgxNavbarComponent`
    - `IgxCircularProgressBar` renamed to `IgxCircularProgressBarComponent`
    - `IgxLinearProgressBar ` renamed to `IgxLinearProgressBarComponent`
    - `IgxRadio` renamed to `IgxRadioComponent`
    - `IgxScroll` renamed to `IgxScrollComponent`
    - `IgxSlider` renamed to `IgxSliderComponent`
    - `IgxSnackbar` renamed to `IgxSnackbarComponent`
    - `IgxSwitch ` renamed to `IgxSwitchComponent`
    - `IgxTabBar` renamed to `IgxTabBarComponent`
    - `IgxTabPanel` renamed to `IgxTabPanelComponent`
    - `IgxTab` renamed to `IgxTabComponent`
    - `IgxToast` renamed to `IgxToastComponent`
    - `IgxLabelDirective` moved inside `../directives/label/` folder
    - `IgxInputDirective` moved inside `../directives/input/` folder
    - `IgxButtonDirective` moved inside `../directives/button/` folder
    - `IgxLayoutDirective` moved inside `../directives/layout/` folder
    - `IgxFilterDirective` moved inside `../directives/filter/` folder
    - `IgxDraggableDirective` moved inside `../directives/dragdrop/` folder
    - `IgxRippleDirective` moved inside `../directives/ripple/` folder
    - Folder `"./navigation/nav-service"` renamed to `"./navigation/nav.service"`
