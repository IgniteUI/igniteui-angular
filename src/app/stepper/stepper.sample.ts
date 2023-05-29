import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HorizontalAnimationType } from 'projects/igniteui-angular/src/lib/carousel/carousel-base';
import {
    IgxStepperTitlePosition, IgxStepperOrientation, IgxStepType, VerticalAnimationType
} from 'projects/igniteui-angular/src/lib/stepper/stepper.common';
import { IgxStepperComponent } from 'projects/igniteui-angular/src/lib/stepper/stepper.component';
import { IgxHintDirective } from '../../../projects/igniteui-angular/src/lib/directives/hint/hint.directive';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxSelectItemComponent } from '../../../projects/igniteui-angular/src/lib/select/select-item.component';
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { IgxTimePickerComponent } from '../../../projects/igniteui-angular/src/lib/time-picker/time-picker.component';
import { IgxBadgeComponent } from '../../../projects/igniteui-angular/src/lib/badge/badge.component';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';
import { NgIf } from '@angular/common';
import { IgxStepComponent } from '../../../projects/igniteui-angular/src/lib/stepper/step/step.component';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxStepActiveIndicatorDirective, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective } from '../../../projects/igniteui-angular/src/lib/stepper/stepper.directive';
import { IgxStepperComponent as IgxStepperComponent_1 } from '../../../projects/igniteui-angular/src/lib/stepper/stepper.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

@Component({
    templateUrl: 'stepper.sample.html',
    styleUrls: ['stepper.sample.scss'],
    standalone: true,
    imports: [IgxButtonDirective, IgxButtonGroupComponent, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSuffixDirective, IgxSwitchComponent, IgxStepperComponent_1, IgxStepActiveIndicatorDirective, IgxIconComponent, IgxStepComponent, IgxStepIndicatorDirective, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, NgIf, IgxAvatarComponent, IgxBadgeComponent, IgxTimePickerComponent, ReactiveFormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective]
})
export class IgxStepperSampleComponent {
    @ViewChild('stepper', { static: true }) public stepper: IgxStepperComponent;
    public displayStep = false;
    public horizontalAnimationType: HorizontalAnimationType = 'slide';
    public verticalAnimationType: VerticalAnimationType = 'grow';
    public animationDuration = 320;
    public stepType: IgxStepType = IgxStepType.Full;
    public titlePos: IgxStepperTitlePosition = IgxStepperTitlePosition.Bottom;
    public setTitlePos = false;
    public stepTypes = [];
    public titlePositions = [];
    public horizontalAnimationTypes = [];
    public verticalAnimationTypes = [];

    public user = {
        firstName: 'John',
        lastName: 'Doe'
    };

    public user1 = {
        password: '1337s3cr3t',
        phone: '',
        dateOfBirth: new Date('07 July, 1987')
    };

    public user2 = {
        firstName: 'Sam',
        lastName: ''
    };

    public user3: UntypedFormGroup;
    public user4: UntypedFormGroup;

    constructor(private cdr: ChangeDetectorRef, fb: UntypedFormBuilder) {
        this.stepTypes = [
            {
                label: 'Indicator', stepType: IgxStepType.Indicator,
                selected: this.stepType === IgxStepType.Indicator, togglable: true
            },
            {
                label: 'Title', stepType: IgxStepType.Title,
                selected: this.stepType === IgxStepType.Title, togglable: true
            },
            {
                label: 'Full', stepType: IgxStepType.Full,
                selected: this.stepType === IgxStepType.Full, togglable: true
            }
        ];

        this.titlePositions = [
            {
                label: 'Bottom', titlePos: IgxStepperTitlePosition.Bottom,
                selected: this.titlePos === IgxStepperTitlePosition.Bottom, togglable: true
            },
            {
                label: 'Top', titlePos: IgxStepperTitlePosition.Top,
                selected: this.titlePos === IgxStepperTitlePosition.Top, togglable: true
            },
            {
                label: 'End', titlePos: IgxStepperTitlePosition.End,
                selected: this.titlePos === IgxStepperTitlePosition.End, togglable: true
            },
            {
                label: 'Start', titlePos: IgxStepperTitlePosition.Start,
                selected: this.titlePos === IgxStepperTitlePosition.Start, togglable: true
            }
        ];

        this.horizontalAnimationTypes = [
            {
                label: 'slide', horizontalAnimationType: HorizontalAnimationType.slide,
                selected: this.horizontalAnimationType === HorizontalAnimationType.slide, togglable: true
            },
            {
                label: 'fade', horizontalAnimationType: HorizontalAnimationType.fade,
                selected: this.horizontalAnimationType === HorizontalAnimationType.fade, togglable: true
            },
            {
                label: 'none', horizontalAnimationType: HorizontalAnimationType.none,
                selected: this.horizontalAnimationType === HorizontalAnimationType.none, togglable: true
            }
        ];

        this.verticalAnimationTypes = [
            {
                label: 'grow', verticalAnimationType: VerticalAnimationType.Grow,
                selected: this.verticalAnimationType === VerticalAnimationType.Grow, togglable: true
            },
            {
                label: 'fade', verticalAnimationType: VerticalAnimationType.Fade,
                selected: this.verticalAnimationType === VerticalAnimationType.Fade, togglable: true
            },
            {
                label: 'none', verticalAnimationType: VerticalAnimationType.None,
                selected: this.verticalAnimationType === VerticalAnimationType.None, togglable: true
            }
        ];

        this.user3 = fb.group({
            fullName: new UntypedFormControl('', Validators.required),
            email: ['', Validators.required]
        });

        this.user4 = fb.group({
            phone: ['', Validators.required],
            dateTime: ['']
        });
    }

    public toggleStepTypes(event) {
        this.stepType = this.stepTypes[event.index].stepType;
    }

    public toggleHorizontalAnimations(event) {
        this.horizontalAnimationType = this.horizontalAnimationTypes[event.index].horizontalAnimationType;
    }

    public toggleVerticalAnimations(event) {
        this.verticalAnimationType = this.verticalAnimationTypes[event.index].verticalAnimationType;
    }

    public setTitlePosition(event) {
        this.setTitlePos = event.checked;
        this.stepper.titlePosition = event.checked ? this.titlePos : null;
    }

    public toggleTitlePos(event) {
        this.titlePos = this.titlePositions[event.index].titlePos;
        if (this.setTitlePos) {
            this.stepper.titlePosition = this.titlePos;
        }
    }

    public activeChanged() {
        console.log('GOLQM ACTIVE CHANGED');
    }

    public activeStepChange(ev) {
        console.log('MALUK CHANGE', ev);
    }

    public activeStepChanging(ev) {
        console.log('ACTIVE STEP CHANGING');
        // ev.cancel = true;
        console.log(ev);
    }

    public changeOrientation() {
        if (this.stepper.orientation === IgxStepperOrientation.Horizontal) {
            this.stepper.orientation = IgxStepperOrientation.Vertical;
        } else {
            this.stepper.orientation = IgxStepperOrientation.Horizontal;
        }
    }
}
