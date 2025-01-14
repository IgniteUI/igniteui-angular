import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    ViewChild
} from '@angular/core';

import { IgxIconComponent } from '../icon/icon.component';
import { IToggleView } from '../core/navigation';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { IgxBannerActionsDirective } from './banner.directives';
import { NgIf } from '@angular/common';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxExpansionPanelBodyComponent } from '../expansion-panel/expansion-panel-body.component';
import { IgxExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { BannerResourceStringsEN, IBannerResourceStrings } from '../core/i18n/banner-resources';
import { getCurrentResourceStrings } from '../core/i18n/resources';

export interface BannerEventArgs extends IBaseEventArgs {
    event?: Event;
}

export interface BannerCancelEventArgs extends BannerEventArgs, CancelableEventArgs {
}
/**
 * **Ignite UI for Angular Banner** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner.html)
 *
 * The Ignite UI Banner provides a highly template-able and easy to use banner that can be shown in your application.
 *
 * Usage:
 *
 * ```html
 * <igx-banner #banner>
 *   Our privacy settings have changed.
 *  <igx-banner-actions>
 *      <button type="button" igxButton="contained">Read More</button>
 *      <button type="button" igxButton="contained">Accept and Continue</button>
 *  </igx-banner-actions>
 * </igx-banner>
 * ```
 */
@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html',
    imports: [IgxExpansionPanelComponent, IgxExpansionPanelBodyComponent, NgIf, IgxButtonDirective, IgxRippleDirective]
})
export class IgxBannerComponent implements IToggleView {
    /**
     * @hidden
     */
    @ContentChild(IgxIconComponent)
    public bannerIcon: IgxIconComponent;

    /**
     * Fires after the banner shows up
     * ```typescript
     * public handleOpened(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (opened)="handleOpened($event)"></igx-banner>
     * ```
     */
    @Output()
    public opened = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner shows up
     * ```typescript
     * public handleOpening(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (opening)="handleOpening($event)"></igx-banner>
     * ```
     */
    @Output()
    public opening = new EventEmitter<BannerCancelEventArgs>();

    /**
     * Fires after the banner hides
     * ```typescript
     * public handleClosed(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (closed)="handleClosed($event)"></igx-banner>
     * ```
     */
    @Output()
    public closed = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner hides
     * ```typescript
     * public handleClosing(event) {
     *  ...
     * }
     * ```
     * ```html
     * <igx-banner (closing)="handleClosing($event)"></igx-banner>
     * ```
     */
    @Output()
    public closing = new EventEmitter<BannerCancelEventArgs>();

    /** @hidden */
    public get useDefaultTemplate(): boolean {
        return !this._bannerActionTemplate;
    }

    /**
     * Set the animation settings used by the banner open/close methods
     * ```typescript
     * import { slideInLeft, slideOutRight } from 'igniteui-angular';
     * ...
     * banner.animationSettings: ToggleAnimationSettings = { openAnimation: slideInLeft, closeAnimation: slideOutRight };
     * ```
     */
    public set animationSettings(settings: ToggleAnimationSettings) {
        this._animationSettings = settings;
    }

    /**
     * Get the animation settings used by the banner open/close methods
     * ```typescript
     * let currentAnimations: ToggleAnimationSettings = banner.animationSettings
     * ```
     */
    @Input()
    public get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings ? this._animationSettings : this._expansionPanel.animationSettings;
    }

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IBannerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    public get resourceStrings(): IBannerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Gets/Sets whether the banner is expanded (visible) or collapsed (hidden).
     * Defaults to `false`.
     * Setting to `true` opens the banner, while `false` closes it.
     *
     * @example
     * // Expand the banner
     * banner.expanded = true;
     *
     * @example
     * // Collapse the banner
     * banner.expanded = false;
     *
     * @example
     * // Check if the banner is expanded
     * const isExpanded = banner.expanded;
     */
    @Input()
    public get expanded(): boolean {
        return this._expanded;
    }

    public set expanded(value: boolean) {
        if (value === this._expanded) {
            return;
        }

        this._expanded = value;
        this._shouldFireEvent = true;

        if (value) {
            this._expansionPanel.open();
        } else {
            this._expansionPanel.close();
        }
    }

    /**
     * Gets whether the banner is collapsed.
     *
     * ```typescript
     * const isCollapsed: boolean = banner.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this._expansionPanel.collapsed;
    }

    /**
     * Returns the native element of the banner component
     * ```typescript
     *  const myBannerElement: HTMLElement = banner.element;
     * ```
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding('class')
    public cssClass = 'igx-banner-host';

    /**
     * @hidden
     */
    @HostBinding('style.display')
    public get displayStyle(): string {
        return this.collapsed ? '' : 'block';
    }

    @ViewChild('expansionPanel', { static: true })
    private _expansionPanel: IgxExpansionPanelComponent;

    @ContentChild(IgxBannerActionsDirective)
    private _bannerActionTemplate: IgxBannerActionsDirective;

    private _expanded: boolean = false;
    private _shouldFireEvent: boolean = false;
    private _bannerEvent: BannerEventArgs;
    private _animationSettings: ToggleAnimationSettings;
    private _resourceStrings = getCurrentResourceStrings(BannerResourceStringsEN);

    constructor(public elementRef: ElementRef<HTMLElement>) { }

    /**
     * Opens the banner
     *
     * ```typescript
     *  myBanner.open();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button type="button" (click)="banner.open()">Open Banner</button>
     * ```
     */
    public open(event?: Event) {
        this._bannerEvent = { owner: this, event };
        const openingArgs: BannerCancelEventArgs = {
            owner: this,
            event,
            cancel: false
        };
        this.opening.emit(openingArgs);
        if (openingArgs.cancel) {
            return;
        }
        this._expansionPanel.open(event);
        this._expanded = true;
        this._shouldFireEvent = false;
    }

    /**
     * Closes the banner
     *
     * ```typescript
     *  myBanner.close();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button type="button" (click)="banner.close()">Close Banner</button>
     * ```
     */
    public close(event?: Event) {
        this._bannerEvent = { owner: this, event};
        const closingArgs: BannerCancelEventArgs = {
            owner: this,
            event,
            cancel: false
        };
        this.closing.emit(closingArgs);
        if (closingArgs.cancel) {
            return;
        }
        this._expansionPanel.close(event);
        this._expanded = false;
        this._shouldFireEvent = false;
    }

    /**
     * Toggles the banner
     *
     * ```typescript
     *  myBanner.toggle();
     * ```
     *
     * ```html
     * <igx-banner #banner>
     * ...
     * </igx-banner>
     * <button type="button" (click)="banner.toggle()">Toggle Banner</button>
     * ```
     */
    public toggle(event?: Event) {
        if (this.collapsed) {
            this.open(event);
        } else {
            this.close(event);
        }
    }

    /** @hidden */
    public onExpansionPanelOpen() {
        if (this._shouldFireEvent) {
            return;
        }
        this.opened.emit(this._bannerEvent);
    }

    /** @hidden */
    public onExpansionPanelClose() {
        if (this._shouldFireEvent) {
            return;
        }
        this.closed.emit(this._bannerEvent);
    }
}
