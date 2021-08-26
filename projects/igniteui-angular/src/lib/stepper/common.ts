import { InjectionToken } from '@angular/core';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';
import { IgxStepperComponent } from './igx-stepper.component';

// Events
export interface IStepperEventArgs extends IBaseEventArgs {
    index: number;
    owner: IgxStepperComponent;
}

export interface IStepperCancelableEventArgs extends CancelableEventArgs {
    oldIndex: number;
    newIndex: number;
    owner: IgxStepperComponent;
}

// Enums
export enum IgxStepperOrienatation {
    Horizontal,
    Vertical
}

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
