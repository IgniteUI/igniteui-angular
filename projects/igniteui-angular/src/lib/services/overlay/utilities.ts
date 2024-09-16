import { AnimationReferenceMetadata } from '@angular/animations';
import { ComponentRef, ElementRef, Injector, NgZone } from '@angular/core';
import { CancelableBrowserEventArgs, CancelableEventArgs, cloneValue, IBaseEventArgs } from '../../core/utils';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { AnimationPlayer } from '../animation/animation';
import { IPositionStrategy } from './position/IPositionStrategy';
import { IScrollStrategy } from './scroll';

/* blazorAlternateName: GridHorizontalAlignment */
export enum HorizontalAlignment {
    Left = -1,
    Center = -0.5,
    Right = 0
}

/* blazorAlternateName: GridVerticalAlignment */
export enum VerticalAlignment {
    Top = -1,
    Middle = -0.5,
    Bottom = 0
}

/**
 * Defines the possible values of the overlays' position strategy.
 */
export enum RelativePositionStrategy {
    Connected = 'connected',
    Auto = 'auto',
    Elastic = 'elastic'
}

/**
 * Defines the possible positions for the relative overlay settings presets.
 */
export enum RelativePosition {
    Above = 'above',
    Below = 'below',
    Before = 'before',
    After = 'after',
    Default = 'default'
}

/**
 * Defines the possible positions for the absolute overlay settings presets.
 */
export enum AbsolutePosition {
    Bottom = 'bottom',
    Top = 'top',
    Center = 'center'
}

/**
 * Determines whether to add or set the offset values.
 */
export enum OffsetMode {
    Add,
    Set
}

// TODO: make this interface
export class Point {
    constructor(public x: number, public y: number) { }
}

/** @hidden */
export interface OutOfViewPort {
    /** Out of view port at Top or Left */
    back: number;
    /** Out of view port at Bottom or Right */
    forward: number;
}

export interface PositionSettings {
    /** Direction in which the component should show */
    horizontalDirection?: HorizontalAlignment;
    /** Direction in which the component should show */
    verticalDirection?: VerticalAlignment;
    /** Target's starting point */
    horizontalStartPoint?: HorizontalAlignment;
    /** Target's starting point */
    verticalStartPoint?: VerticalAlignment;
    /* blazorSuppress */
    /** Animation applied while overlay opens */
    openAnimation?: AnimationReferenceMetadata;
    /* blazorSuppress */
    /** Animation applied while overlay closes */
    closeAnimation?: AnimationReferenceMetadata;
    /** The size up to which element may shrink when shown in elastic position strategy */
    minSize?: Size;
}

export interface OverlaySettings {
    /** Attaching target for the component to show */
    target?: Point | HTMLElement;
    /** Position strategy to use with these settings */
    positionStrategy?: IPositionStrategy;
    /** Scroll strategy to use with these settings */
    scrollStrategy?: IScrollStrategy;
    /** Set if the overlay should be in modal mode */
    modal?: boolean;
    /** Set if the overlay should close on outside click */
    closeOnOutsideClick?: boolean;
    /** Set if the overlay should close when `Esc` key is pressed */
    closeOnEscape?: boolean;
    /* blazorSuppress */
    /** Set the outlet container to attach the overlay to */
    outlet?: IgxOverlayOutletDirective | ElementRef;
    /**
     * @hidden @internal
     * Elements to be excluded for closeOnOutsideClick.
     * Clicking on the elements in this collection will not close the overlay when closeOnOutsideClick = true.
     */
    excludeFromOutsideClick?: HTMLElement[];
}

export interface OverlayEventArgs extends IBaseEventArgs {
    /** Id of the overlay generated with `attach()` method */
    id: string;
    /** Available when `Type<T>` is provided to the `attach()` method and allows access to the created Component instance */
    componentRef?: ComponentRef<any>;
    /** Will provide the elementRef of the markup that will be displayed in the overlay */
    elementRef?: ElementRef<any>;
    /** Will provide the overlay settings which will be used when the component is attached */
    settings?: OverlaySettings;
    /** Will provide the original keyboard event if closed from ESC or click */
    event?: Event;
}

export interface OverlayCancelableEventArgs extends OverlayEventArgs, CancelableEventArgs {
}

export interface OverlayClosingEventArgs extends OverlayEventArgs, CancelableBrowserEventArgs {
}

export interface OverlayAnimationEventArgs extends IBaseEventArgs {
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

/** @hidden */
export interface OverlayInfo {
    id?: string;
    visible?: boolean;
    detached?: boolean;
    elementRef?: ElementRef;
    componentRef?: ComponentRef<any>;
    settings?: OverlaySettings;
    initialSize?: Size;
    hook?: HTMLElement;
    openAnimationPlayer?: AnimationPlayer;
    // calling animation.destroy in detach fires animation.done. This should not happen
    // this is why we should trace if animation ever started
    openAnimationDetaching?: boolean;
    closeAnimationPlayer?: AnimationPlayer;
    // calling animation.destroy in detach fires animation.done. This should not happen
    // this is why we should trace if animation ever started
    closeAnimationDetaching?: boolean;
    ngZone: NgZone;
    transformX?: number;
    transformY?: number;
    event?: Event;
    wrapperElement?: HTMLElement;
    size?: string
}

/** @hidden */
export interface ConnectedFit {
    contentElementRect?: Partial<DOMRect>;
    targetRect?: Partial<DOMRect>;
    viewPortRect?: Partial<DOMRect>;
    fitHorizontal?: OutOfViewPort;
    fitVertical?: OutOfViewPort;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    horizontalOffset?: number;
    verticalOffset?: number;
}

export interface OverlayCreateSettings extends OverlaySettings {
    /**
     * An `Injector` instance to add in the created component ref's injectors tree.
     */
    injector?: Injector
}

/** @hidden @internal */
export class Util {
    /**
     * Calculates the rectangle of target for provided overlay settings. Defaults to 0,0,0,0,0,0 rectangle
     * if no target is provided
     *
     * @param settings Overlay settings for which to calculate target rectangle
     */
    public static getTargetRect(target?: Point | HTMLElement): Partial<DOMRect> {
        let targetRect: Partial<DOMRect> = {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0
        };
        if (target instanceof HTMLElement) {
            targetRect = (target as HTMLElement).getBoundingClientRect();
        } else if (target instanceof Point) {
            const targetPoint = target as Point;
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

    public static getViewportRect(document: Document): Partial<DOMRect> {
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const scrollPosition = Util.getViewportScrollPosition(document);

        return {
            top: scrollPosition.y,
            left: scrollPosition.x,
            right: scrollPosition.x + width,
            bottom: scrollPosition.y + height,
            width,
            height,
        };
    }

    public static getViewportScrollPosition(document: Document): Point {
        const documentElement = document.documentElement;
        const documentRect = documentElement.getBoundingClientRect();

        const horizontalScrollPosition =
            -documentRect.left || document.body.scrollLeft || window.scrollX || documentElement.scrollLeft || 0;
        const verticalScrollPosition = -documentRect.top || document.body.scrollTop || window.scrollY || documentElement.scrollTop || 0;

        return new Point(horizontalScrollPosition, verticalScrollPosition);
    }

    public static cloneInstance(object) {
        const clonedObj = Object.assign(Object.create(Object.getPrototypeOf(object)), object);
        clonedObj.settings = cloneValue(clonedObj.settings);
        return clonedObj;
    }
}
