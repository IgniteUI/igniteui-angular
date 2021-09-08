import { InjectionToken } from '@angular/core';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';
import { IgxStepperComponent } from './igx-stepper.component';
import { IgxStepComponent } from './step/igx-step.component';

// Events
export interface IStepTogglingEventArgs extends IBaseEventArgs, IBaseCancelableBrowserEventArgs {
    activeStep: IgxStepComponent;
    previousActiveStep: IgxStepComponent;
    owner: IgxStepperComponent;
}

export interface IStepToggledEventArgs extends IBaseEventArgs {
    activeStep: IgxStepComponent;
    owner: IgxStepperComponent;
}

// Enums

export const IgxStepperOrienatation = mkenum({
    Horizontal: 'Horizontal',
    Vertical: 'Vertical'
});
export type IgxStepperOrienatation = (typeof IgxStepperOrienatation)[keyof typeof IgxStepperOrienatation];


export enum IgxStepType {
    Indicator,
    Label,
    Full
}

export enum IgxStepperLabelPosition {
    Bottom,
    Top,
    End,
    Start
}

export enum IgxStepperProgressLine {
    Solid,
    Dashed
}

// Token
export const IGX_STEPPER_COMPONENT = new InjectionToken<IgxStepperComponent>('IgxStepperToken');
