import { IScrollStrategy } from './IScrollStrategy';
import { IgxOverlayService } from '../overlay';
import { IPositionStrategy } from '../position';
import { ElementRef, ComponentRef } from '@angular/core';
import { OverlaySettings, PositionSettings, Point } from '../utilities';

export class AbsoluteScrollStrategy implements IScrollStrategy {
    private _initialized = false;
    private _document: Document;
    private _overlayService: IgxOverlayService;
    private _id: string;
    private _scrollContainer: HTMLElement;
    private _component: {
        id: string,
        elementRef: ElementRef,
        componentRef: ComponentRef<{}>,
        size: { width: number, height: number },
        settings: OverlaySettings
    };

    constructor(scrollContainer?: HTMLElement) {
        this._scrollContainer = scrollContainer;
    }

    initialize(document: Document, overlayService: IgxOverlayService, id: string) {
        if (this._initialized) {
            return;
        }
        this._overlayService = overlayService;
        this._id = id;
        this._document = document;
        this._component = this._overlayService.getElementById(id);
        this._initialized = true;
    }

    attach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll, true);
        } else {
            this._document.addEventListener('scroll', this.onScroll, true);
        }
    }

    detach(): void {
        if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this.onScroll, true);
        } else {
            this._document.addEventListener('scroll', this.onScroll, true);
        }
    }

    private onScroll = (ev: Event) => {
        this.updatedPositionSettingsPoint(this._component.settings.positionStrategy._settings);
        this._component.settings.positionStrategy.position(
            this._component.elementRef.nativeElement,
            this._component.elementRef.nativeElement.parentElement,
            this._component.size,
            this._document
        );
    }

    private updatedPositionSettingsPoint(positionSettings: PositionSettings) {
        if (positionSettings && positionSettings.element) {
            const elementRect = positionSettings.element.getBoundingClientRect();
            const x = elementRect.right + elementRect.width * positionSettings.horizontalStartPoint;
            const y = elementRect.bottom + elementRect.height * positionSettings.verticalStartPoint;
            positionSettings.point = new Point(x, y);
        }
    }
}
