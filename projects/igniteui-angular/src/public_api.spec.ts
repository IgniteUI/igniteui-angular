import { isStandalone, Type } from '@angular/core';
import { IGX_ACCORDION_DIRECTIVES } from 'igniteui-angular/accordion';
import { IGX_ACTION_STRIP_DIRECTIVES } from 'igniteui-angular/action-strip';
import { IGX_BANNER_DIRECTIVES } from 'igniteui-angular/banner';
import { IGX_BOTTOM_NAV_DIRECTIVES } from 'igniteui-angular/bottom-nav';
import { IGX_BUTTON_GROUP_DIRECTIVES } from 'igniteui-angular/button-group';
import { IGX_CALENDAR_DIRECTIVES } from 'igniteui-angular/calendar';
import { IGX_CARD_DIRECTIVES } from 'igniteui-angular/card';
import { IGX_CAROUSEL_DIRECTIVES } from 'igniteui-angular/carousel';
import { IGX_CHIPS_DIRECTIVES } from 'igniteui-angular/chips';
import { IGX_COMBO_DIRECTIVES } from 'igniteui-angular/combo';
import { IGX_DATE_PICKER_DIRECTIVES, IGX_DATE_RANGE_PICKER_DIRECTIVES } from 'igniteui-angular/date-picker';
import { IGX_DIALOG_DIRECTIVES } from 'igniteui-angular/dialog';
import { IGX_DRAG_DROP_DIRECTIVES, IGX_TOOLTIP_DIRECTIVES } from 'igniteui-angular/directives';
import { IGX_DROP_DOWN_DIRECTIVES } from 'igniteui-angular/drop-down';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular/expansion-panel';
import { IGX_GRID_COMMON_DIRECTIVES, IGX_GRID_VALIDATION_DIRECTIVES } from 'igniteui-angular/grids/core';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGX_HIERARCHICAL_GRID_DIRECTIVES } from 'igniteui-angular/grids/hierarchical-grid';
import { IGX_PIVOT_GRID_DIRECTIVES } from 'igniteui-angular/grids/pivot-grid';
import { IGX_TREE_GRID_DIRECTIVES } from 'igniteui-angular/grids/tree-grid';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IGX_NAVBAR_DIRECTIVES } from 'igniteui-angular/navbar';
import { IGX_NAVIGATION_DRAWER_DIRECTIVES } from 'igniteui-angular/navigation-drawer';
import { IGX_PAGINATOR_DIRECTIVES } from 'igniteui-angular/paginator';
import {
    IGX_CIRCULAR_PROGRESS_BAR_DIRECTIVES,
    IGX_LINEAR_PROGRESS_BAR_DIRECTIVES,
    IGX_PROGRESS_BAR_DIRECTIVES
} from 'igniteui-angular/progressbar';
import { IGX_QUERY_BUILDER_DIRECTIVES } from 'igniteui-angular/query-builder';
import { IGX_RADIO_GROUP_DIRECTIVES } from 'igniteui-angular/radio';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular/select';
import { IGX_SIMPLE_COMBO_DIRECTIVES } from 'igniteui-angular/simple-combo';
import { IGX_SLIDER_DIRECTIVES } from 'igniteui-angular/slider';
import { IGX_SPLITTER_DIRECTIVES } from 'igniteui-angular/splitter';
import { IGX_STEPPER_DIRECTIVES } from 'igniteui-angular/stepper';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { IGX_TIME_PICKER_DIRECTIVES } from 'igniteui-angular/time-picker';
import { IGX_TREE_DIRECTIVES } from 'igniteui-angular/tree';
import { describe, it, expect } from 'vitest';

const collections: Record<string, readonly Type<unknown>[]> = {
    IGX_ACCORDION_DIRECTIVES,
    IGX_ACTION_STRIP_DIRECTIVES,
    IGX_BANNER_DIRECTIVES,
    IGX_BOTTOM_NAV_DIRECTIVES,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IGX_CALENDAR_DIRECTIVES,
    IGX_CARD_DIRECTIVES,
    IGX_CAROUSEL_DIRECTIVES,
    IGX_CHIPS_DIRECTIVES,
    IGX_CIRCULAR_PROGRESS_BAR_DIRECTIVES,
    IGX_COMBO_DIRECTIVES,
    IGX_DATE_PICKER_DIRECTIVES,
    IGX_DATE_RANGE_PICKER_DIRECTIVES,
    IGX_DIALOG_DIRECTIVES,
    IGX_DRAG_DROP_DIRECTIVES,
    IGX_DROP_DOWN_DIRECTIVES,
    IGX_EXPANSION_PANEL_DIRECTIVES,
    IGX_GRID_COMMON_DIRECTIVES,
    IGX_GRID_DIRECTIVES,
    IGX_GRID_VALIDATION_DIRECTIVES,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_LINEAR_PROGRESS_BAR_DIRECTIVES,
    IGX_LIST_DIRECTIVES,
    IGX_NAVBAR_DIRECTIVES,
    IGX_NAVIGATION_DRAWER_DIRECTIVES,
    IGX_PAGINATOR_DIRECTIVES,
    IGX_PIVOT_GRID_DIRECTIVES,
    IGX_PROGRESS_BAR_DIRECTIVES,
    IGX_QUERY_BUILDER_DIRECTIVES,
    IGX_RADIO_GROUP_DIRECTIVES,
    IGX_SELECT_DIRECTIVES,
    IGX_SIMPLE_COMBO_DIRECTIVES,
    IGX_SLIDER_DIRECTIVES,
    IGX_SPLITTER_DIRECTIVES,
    IGX_STEPPER_DIRECTIVES,
    IGX_TABS_DIRECTIVES,
    IGX_TIME_PICKER_DIRECTIVES,
    IGX_TOOLTIP_DIRECTIVES,
    IGX_TREE_DIRECTIVES,
    IGX_TREE_GRID_DIRECTIVES
};

describe('Entry point directive collections', () => {
    // Consumers spread these into `imports`. A circular import between entry points leaves an
    // entry `undefined` at evaluation time, which fails the consumer's component compilation.
    it.each(Object.entries(collections))('%s should contain only defined standalone types', (_name, collection) => {
        expect(collection.length).toBeGreaterThan(0);
        const names = collection.map(type => type?.name);
        collection.forEach((type, index) => {
            expect(type, `entry ${index} of [${names.join(', ')}]`).toBeDefined();
            expect(isStandalone(type), `${type.name} is not standalone`).toBe(true);
        });
    });
});
