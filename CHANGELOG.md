# Ignite UI for Angular Change Log

All notable changes for each version of this project will be documented in this file.

## 5.2.0
- `igx-grid`
    - Data-bound Input property `filtering` changed to `filterable`:

    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>
    ```

    - @HostBinding `min-width` added to `IgxGridCellComponent` and `IgxGridHeaderCell`
- `igx-navigation-drawer` changes:
    - `NavigationDrawer` renamed to `IgxNavigationDrawer`
    - `NavigationDrawerModule` renamed to `IgxNavigationDrawerModule`
    - `NavigationService` renamed to `IgxNavigationService`
    - `NavigationToggle` renamed to `IgxNavigationToggle`
    - `NavigationClose` renamed to `IgxNavigationClose`
    - CSS class `ig-nav-drawer-overlay` renamed to `igx-nav-drawer-overlay`
    - CSS class `ig-nav-drawer` renamed to `igx-nav-drawer`
    - `ig-drawer-mini-content` to `igx-drawer-mini-content`
    - `ig-drawer-content` to `igx-drawer-content`
    - `ig-form-group` to `igx-form-group`
- Renaming and restructuring directives and components based on ng naming guidelines:
    - `IgxIcon` renamed to `IgxIconComponent`
    - `IgxAvatar` renamed to `IgxAvatarComponent`
    - `IgxBadge` renamed to `IgxBadgeComponent`
    - `IgxButton` renamed to `IgxButtonDirective`
    - `IgxButtonGroup` renamed to `IgxButtonGroupComponent`
    - `IgxLabelDirective` moved inside `../directives/label/` folder
    - `IgxInputDirective` moved inside `../directives/input/` folder
    - `IgxButtonDirective` moved inside `../directives/button/` folder
    - `IgxLayoutDirective` moved inside `../directives/layout/` folder
    - `IgxFilterDirective` moved inside `../directives/filter/` folder
    - `IgxDraggableDirective` moved inside `../directives/dragdrop/` folder
    - `IgxRippleDirective` moved inside `../directives/ripple/` folder
- Theming
