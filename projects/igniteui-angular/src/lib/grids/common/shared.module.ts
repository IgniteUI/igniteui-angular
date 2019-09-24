import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxDatePickerModule } from '../../date-picker/date-picker.component';
import { IgxIconModule } from '../../icon/index';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../../input-group/index';
import { IgxFocusModule } from '../../directives/focus/focus.directive';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxForOfModule } from '../../directives/for-of/for_of.directive';
import { IgxTemplateOutletModule } from '../../directives/template-outlet/template_outlet.directive';
import { IgxTextHighlightModule } from '../../directives/text-highlight/text-highlight.directive';
import { IgxTextSelectionModule } from '../../directives/text-selection/text-selection.directive';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { IgxBadgeModule } from '../../badge/badge.component';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxDragDropModule } from '../../directives/drag-drop/drag-drop.directive';
import { IgxButtonGroupModule } from '../../buttonGroup/buttonGroup.component';
import { IgxProgressBarModule } from '../../progressbar/progressbar.component';
import { IgxSelectModule } from '../../select/select.module';
import { IgxDropDownModule } from '../../drop-down/index';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxFocusModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTemplateOutletModule,
        IgxTextHighlightModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxBadgeModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxProgressBarModule,
        IgxSelectModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxIconModule,
        IgxRippleModule,
        IgxInputGroupModule,
        IgxFocusModule,
        IgxToggleModule,
        IgxForOfModule,
        IgxTemplateOutletModule,
        IgxTextHighlightModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxBadgeModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxProgressBarModule,
        IgxSelectModule
    ]
})
export class IgxGridSharedModules {}
