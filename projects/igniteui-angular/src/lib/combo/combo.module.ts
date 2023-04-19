import { NgModule } from '@angular/core';
import {
    IgxComboAddItemDirective,
    IgxComboClearIconDirective,
    IgxComboEmptyDirective,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxComboHeaderItemDirective,
    IgxComboItemDirective,
    IgxComboToggleIconDirective
} from './combo.directives';
import { IgxComboComponent } from './combo.component';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxComboComponent,
        IgxComboAddItemDirective,
        IgxComboClearIconDirective,
        IgxComboEmptyDirective,
        IgxComboFooterDirective,
        IgxComboHeaderDirective,
        IgxComboHeaderItemDirective,
        IgxComboItemDirective,
        IgxComboToggleIconDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective
    ],
    exports: [
        IgxComboComponent,
        IgxComboAddItemDirective,
        IgxComboClearIconDirective,
        IgxComboEmptyDirective,
        IgxComboFooterDirective,
        IgxComboHeaderDirective,
        IgxComboHeaderItemDirective,
        IgxComboItemDirective,
        IgxComboToggleIconDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective
    ]
})
export class IgxComboModule { }
