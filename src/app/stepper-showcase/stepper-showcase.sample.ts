import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, IgxSuffixDirective, IgxSwitchComponent, IgxStepActiveIndicatorDirective, IgxIconComponent, IgxStepComponent, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, IgxAvatarComponent, IgxBadgeComponent, IgxTimePickerComponent, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective, IgxStepperComponent } from 'igniteui-angular';
import { defineComponents, IgcStepperComponent, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

@Component({
    templateUrl: 'stepper-showcase.sample.html',
    styleUrls: ['stepper-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonDirective, IgxButtonGroupComponent, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSuffixDirective, IgxSwitchComponent, IgxStepperComponent, IgxStepActiveIndicatorDirective, IgxIconComponent, IgxStepComponent, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, NgIf, IgxAvatarComponent, IgxBadgeComponent, IgxTimePickerComponent, ReactiveFormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective]
})
export class IgxStepperShowcaseSampleComponent {}
