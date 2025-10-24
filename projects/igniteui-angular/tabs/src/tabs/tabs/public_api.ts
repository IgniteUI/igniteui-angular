import { IgxPrefixDirective } from '../../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxTabContentComponent } from './tab-content.component';
import { IgxTabHeaderComponent } from './tab-header.component';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsComponent } from './tabs.component';
import { IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective } from './tabs.directives';

export * from './tabs.component';
export * from './tab-item.component';
export * from './tab-header.component';
export * from './tabs.directives';
export * from './tab-content.component';
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
