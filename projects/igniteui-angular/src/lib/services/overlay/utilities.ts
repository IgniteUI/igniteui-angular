import { GlobalPositionStrategy } from './position/global-position-strategy';
import { IPositionStrategy } from './position/IPositionStrategy';

import { IScrollStrategy, NoOpScrollStrategy } from './scroll';
import { AnimationMetadata, AnimationReferenceMetadata, AnimationPlayer } from '@angular/animations';
import { ComponentRef, ElementRef } from '@angular/core';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { CancelableEventArgs } from '../../core/utils';

export enum HorizontalAlignment {
    Left = -1,
    Center = -0.5,
    Right = 0
}

export enum VerticalAlignment {
    Top = -1,
    Middle = -0.5,
    Bottom = 0
}

export class Point {
    constructor(public x: number, public y: number) { }
}

export interface PositionSettings {
    target?: Point | HTMLElement;
    horizontalDirection?: HorizontalAlignment;
    verticalDirection?: VerticalAlignment;
    horizontalStartPoint?: HorizontalAlignment;
    verticalStartPoint?: VerticalAlignment;
    openAnimation?: AnimationReferenceMetadata;
    closeAnimation?: AnimationReferenceMetadata;
}

export interface OverlaySettings {
    positionStrategy?: IPositionStrategy;
    scrollStrategy?: IScrollStrategy;
    modal?: boolean;
    closeOnOutsideClick?: boolean;
    outlet?: IgxOverlayOutletDirective | ElementRef;
}

export interface OverlayEventArgs {
    /** Id of the overlay as returned by the `show()` method */
    id: string;
    /** Available when `Type<T>` is provided to the `show()` method and allows access to the created Component instance */
    componentRef?: ComponentRef<{}>;
}

export interface OverlayCancelableEventArgs extends OverlayEventArgs, CancelableEventArgs {
}

export interface OverlayAnimationEventArgs {
    /** Id of the overlay as returned by the `show()` method */
    id: string;
    /** Animation player that will play the animation */
    animationPlayer: AnimationPlayer;
    /** Type of animation to be played. It should be either 'open' or 'close' */
    animationType: 'open' | 'close';
}

/** @hidden */
export function getPointFromPositionsSettings(settings: PositionSettings, overlayWrapper: HTMLElement): Point {
    let result: Point = new Point(0, 0);

    if (settings.target instanceof HTMLElement) {
        const rect = (<HTMLElement>settings.target).getBoundingClientRect();
        result.x = rect.right + rect.width * settings.horizontalStartPoint;
        result.y = rect.bottom + rect.height * settings.verticalStartPoint;
    } else if (settings.target instanceof Point) {
        result = settings.target;
    }

    //  if for some reason overlayWrapper is not at 0,0 position, e.g. overlay is in outlet
    //  which is in element with transform,perspective or filter set, we should translate the result
    //  accordingly
    if (overlayWrapper) {
        const overlayWrapperPosition = overlayWrapper.getBoundingClientRect();
        result.x -= overlayWrapperPosition.left;
        result.y -= overlayWrapperPosition.top;
    }

    return result;
}

/** @hidden */
export interface OverlayInfo {
    id?: string;
    elementRef?: ElementRef;
    componentRef?: ComponentRef<{}>;
    settings?: OverlaySettings;
    initialSize?: { width: number, height: number };
    hook?: HTMLElement;
    openAnimationPlayer?: AnimationPlayer;
    closeAnimationPlayer?: AnimationPlayer;
    openAnimationInnerPlayer?: any;
    closeAnimationInnerPlayer?: any;
}
