import { IgxTabContentComponent } from './content/tab-content.component';
import { IgxTabHeaderComponent } from './header/tab-header.component';
import { IgxTabItemComponent } from './item/tab-item.component';
import { IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxTabsComponent } from './tabs.component';
import { IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective } from './tabs.directives';

export * from './tabs.component';
export * from './item/tab-item.component';
export * from './header/tab-header.component';
export * from './tabs.directives';
export * from './content/tab-content.component';
export {
    ITabsSelectedIndexChangingEventArgs,
    ITabsSelectedItemChangeEventArgs
} from '../tabs.directive'

/* NOTE: Tabs directives collection for ease-of-use import in standalone components scenario */
export const IGX_TABS_DIRECTIVES = [
    IgxTabsComponent,
    IgxTabItemComponent,
    IgxTabHeaderComponent,
    IgxTabContentComponent,
    IgxTabHeaderLabelDirective,
    IgxTabHeaderIconDirective,
    IgxPrefixDirective,
    IgxSuffixDirective
] as const;
