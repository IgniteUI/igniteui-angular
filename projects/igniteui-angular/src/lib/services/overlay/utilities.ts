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
    /** Attaching target for the component to show */
    target?: Point | HTMLElement;
    /** Direction in which the component should show */
    horizontalDirection?: HorizontalAlignment;
    /** Direction in which the component should show */
    verticalDirection?: VerticalAlignment;
    /** Target's starting point */
    horizontalStartPoint?: HorizontalAlignment;
    /** Target's starting point */
    verticalStartPoint?: VerticalAlignment;
    /** Animation applied while overlay opens */
    openAnimation?: AnimationReferenceMetadata;
    /** Animation applied while overlay closes */
    closeAnimation?: AnimationReferenceMetadata;
}

export interface OverlaySettings {
    /** Position strategy to use with this settings */
    positionStrategy?: IPositionStrategy;
    /** Scroll strategy to use with this settings */
    scrollStrategy?: IScrollStrategy;
    /** Set if the overlay should be in modal mode */
    modal?: boolean;
    /** Set if the overlay should closed on outside click */
    closeOnOutsideClick?: boolean;
    /** Set the outlet container to attach the overlay to */
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

export interface Size {
    /** Gets or sets the horizontal component of Size */
    width: number;

    /** Gets or sets the vertical component of Size */
    height: number;
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
    initialSize?: Size;
    hook?: HTMLElement;
    openAnimationPlayer?: AnimationPlayer;
    closeAnimationPlayer?: AnimationPlayer;
    openAnimationInnerPlayer?: any;
    closeAnimationInnerPlayer?: any;
}
