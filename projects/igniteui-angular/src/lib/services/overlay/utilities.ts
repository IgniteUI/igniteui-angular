import { IPositionStrategy } from './position/IPositionStrategy';

import { IScrollStrategy } from './scroll';
import { AnimationReferenceMetadata, AnimationPlayer } from '@angular/animations';
import { ComponentRef, ElementRef, NgZone } from '@angular/core';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { CancelableEventArgs, CancelableBrowserEventArgs, cloneValue } from '../../core/utils';

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
    /** The size up to which element may shrink when shown in elastic position strategy */
    minSize?: Size;
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
    /**
     * @hidden @internal
     * Exclude the position strategy target for outside clicks
     */
    excludePositionTarget?: boolean;
}

export interface OverlayEventArgs {
    /** Id of the overlay generated with `attach()` method */
    id: string;
    /** Available when `Type<T>` is provided to the `attach()` method and allows access to the created Component instance */
    componentRef?: ComponentRef<{}>;
}

export interface OverlayCancelableEventArgs extends OverlayEventArgs, CancelableEventArgs {
}

export interface OverlayClosingEventArgs extends OverlayEventArgs, CancelableBrowserEventArgs {
}

export interface OverlayAnimationEventArgs {
    /** Id of the overlay generated with `attach()` method */
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

/**
 * @hidden
 * Calculates the rectangle of target for provided overlay settings. Defaults to 0,0,0,0 rectangle
 * if no target is provided
 * @param settings Overlay settings for which to calculate target rectangle
 */
export function getTargetRect(settings: PositionSettings): ClientRect {
    let targetRect: ClientRect = {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0
    };

    if (settings.target instanceof HTMLElement) {
        targetRect = (settings.target as HTMLElement).getBoundingClientRect();
    } else if (settings.target instanceof Point) {
        const targetPoint = settings.target as Point;
        targetRect = {
            bottom: targetPoint.y,
            height: 0,
            left: targetPoint.x,
            right: targetPoint.x,
            top: targetPoint.y,
            width: 0
        };
    }

    return targetRect;
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
    ngZone: NgZone;
}

/** @hidden @internal */
export function getViewportRect(document: Document): ClientRect {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const scrollPosition = getViewportScrollPosition();

    return {
        top: scrollPosition.y,
        left: scrollPosition.x,
        right: scrollPosition.x + width,
        bottom: scrollPosition.y + height,
        width: width,
        height: height,
    };
}

/** @hidden @internal */
export function getViewportScrollPosition(): Point {
    const documentElement = document.documentElement;
    const documentRect = documentElement.getBoundingClientRect();

    const horizontalScrollPosition = -documentRect.left || document.body.scrollLeft || window.scrollX || documentElement.scrollLeft || 0;
    const verticalScrollPosition = -documentRect.top || document.body.scrollTop || window.scrollY || documentElement.scrollTop || 0;

    return new Point(horizontalScrollPosition, verticalScrollPosition);
}

/** @hidden @internal*/
export function cloneInstance(object) {
    const clonedObj = Object.assign(Object.create(Object.getPrototypeOf(object)), object);
    clonedObj.settings = cloneValue(clonedObj.settings);
    return clonedObj;
}
