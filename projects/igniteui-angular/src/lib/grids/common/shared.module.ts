import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxIconModule } from '../../icon/public_api';
import { IgxRippleModule } from '../../directives/ripple/ripple.directive';
import { IgxInputGroupModule } from '../../input-group/public_api';
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
import { IgxDropDownModule } from '../../drop-down/public_api';
import { IgxGridStateModule } from '../state.directive';
import { IgxSnackbarModule } from '../../snackbar/snackbar.component';
import { IgxDatePickerModule } from '../../date-picker/date-picker.module';
import { IgxTimePickerModule } from '../../time-picker/time-picker.component';
import { IgxDateTimeEditorModule } from '../../directives/date-time-editor/date-time-editor.directive';


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
        IgxSelectModule,
        IgxGridStateModule,
        IgxSnackbarModule,
        IgxTimePickerModule,
        IgxDateTimeEditorModule
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
        IgxGridStateModule,
        IgxTextSelectionModule,
        IgxCheckboxModule,
        IgxBadgeModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxDropDownModule,
        IgxButtonGroupModule,
        IgxProgressBarModule,
        IgxSelectModule,
        IgxSnackbarModule,
        IgxTimePickerModule,
        IgxDateTimeEditorModule
    ]
})
export class IgxGridSharedModules {}
