import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective, IgxSuffixDirective, IgxSwitchComponent, IgxStepActiveIndicatorDirective, IgxIconComponent, IgxStepComponent, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, IgxAvatarComponent, IgxBadgeComponent, IgxTimePickerComponent, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective, IgxStepperComponent, IgxStepperOrientation, IgxStepperTitlePosition, IgxStepType } from 'igniteui-angular';
import { defineComponents, IgcStepperComponent, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

@Component({
    templateUrl: 'stepper-showcase.sample.html',
    styleUrls: ['stepper-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonDirective, IgxButtonGroupComponent, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSuffixDirective, IgxSwitchComponent, IgxStepperComponent, IgxStepActiveIndicatorDirective, IgxIconComponent, IgxStepComponent, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, NgIf, IgxAvatarComponent, IgxBadgeComponent, IgxTimePickerComponent, ReactiveFormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective]
})
export class IgxStepperShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        orientation: {
            control: {
                type: 'button-group',
                options: ['horizontal', 'vertical'],
                defaultValue: 'horizontal'
            }
        },
        stepType: {
            label: 'Step Type',
            control: {
                type: 'button-group',
                options: ['indicator', 'title', 'full'],
                defaultValue: 'full'
            }
        },
        linear: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        contentTop: {
            label: 'Place Content on Top',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        verticalAnimation: {
            label: 'Vertical Animation Type',
            control: {
                type: 'button-group',
                options: ['grow', 'fade', 'none'],
                defaultValue: 'grow'
            }
        },
        horizontalAnimation: {
            label: 'Horizontal Animation Type',
            control: {
                type: 'button-group',
                options: ['slide', 'fade', 'none'],
                defaultValue: 'slide'
            }
        },
        animationDuration: {
            label: 'Animation Duration',
            control: {
                type: 'number',
                defaultValue: 320
            }
        },
        titlePosition: {
            label: 'Title Position',
            control: {
                type: 'select',
                options: ['bottom', 'top', 'start', 'end'],
                defaultValue: 'bottom'
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    protected get stepType(): IgxStepType {
        const stepTypeValue = this.propertyChangeService.getProperty('stepType');
        switch (stepTypeValue) {
            case 'indicator':
                return IgxStepType.Indicator;
            case 'title':
                return IgxStepType.Title;
            case 'full':
                return IgxStepType.Full;
        }
    }

    protected get titlePosition(): IgxStepperTitlePosition {
        const titlePositionValue = this.propertyChangeService.getProperty('titlePosition');
        switch (titlePositionValue) {
            case 'bottom':
                return IgxStepperTitlePosition.Bottom;
            case 'top':
                return IgxStepperTitlePosition.Top;
            case 'start':
                return IgxStepperTitlePosition.Start;
            case 'end':
                return IgxStepperTitlePosition.End;
        }
    }

    protected get orientation(): IgxStepperOrientation {
        const orientationValue = this.propertyChangeService.getProperty('orientation');
        return orientationValue === 'horizontal'
            ? IgxStepperOrientation.Horizontal
            : IgxStepperOrientation.Vertical;
    }
}
