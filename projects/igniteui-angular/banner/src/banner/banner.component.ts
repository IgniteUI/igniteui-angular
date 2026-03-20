import {
    Component,
    ContentChild,
    DestroyRef,
    ElementRef,
    EventEmitter,
    HostBinding,
    inject,
    Input,
    Output,
    ViewChild
} from '@angular/core';

import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxBannerActionsDirective } from './banner.directives';
import {
    CancelableEventArgs,
    IBaseEventArgs,
    BannerResourceStringsEN,
    IBannerResourceStrings,
    getCurrentResourceStrings,
    onResourceChangeHandle,
    IToggleView
} from 'igniteui-angular/core';
import { IgxExpansionPanelBodyComponent, IgxExpansionPanelComponent, ToggleAnimationSettings } from 'igniteui-angular/expansion-panel';

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
 */
@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html',
    imports: [IgxExpansionPanelComponent, IgxExpansionPanelBodyComponent, IgxButtonDirective, IgxRippleDirective]
})
export class IgxBannerComponent implements IToggleView {
    public elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * @hidden
     */
    @ContentChild(IgxIconComponent)
    public bannerIcon: IgxIconComponent;

    /**
     * Fires after the banner shows up
     */
    @Output()
    public opened = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner shows up
     */
    @Output()
    public opening = new EventEmitter<BannerCancelEventArgs>();

    /**
     * Fires after the banner hides
     */
    @Output()
    public closed = new EventEmitter<BannerEventArgs>();

    /**
     * Fires before the banner hides
     */
    @Output()
    public closing = new EventEmitter<BannerCancelEventArgs>();

    /** @hidden */
    public get useDefaultTemplate(): boolean {
        return !this._bannerActionTemplate;
    }

    /**
     * Set the animation settings used by the banner open/close methods
     */
    public set animationSettings(settings: ToggleAnimationSettings) {
        this._animationSettings = settings;
    }

    /**
     * Get the animation settings used by the banner open/close methods
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
        return this._resourceStrings || this._defaultResourceStrings;
    }

    /**
     * Gets/Sets whether the banner is expanded (visible) or collapsed (hidden).
     * Defaults to `false`.
     * Setting to `true` opens the banner, while `false` closes it.
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
     */
    public get collapsed(): boolean {
        return this._expansionPanel.collapsed;
    }

    /**
     * Returns the native element of the banner component
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

    private _destroyRef = inject(DestroyRef);
    private _expanded: boolean = false;
    private _shouldFireEvent: boolean = false;
    private _bannerEvent: BannerEventArgs;
    private _animationSettings: ToggleAnimationSettings;
    private _resourceStrings: IBannerResourceStrings = null;
    private _defaultResourceStrings = getCurrentResourceStrings(BannerResourceStringsEN);

    constructor() {
        onResourceChangeHandle(this._destroyRef, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(BannerResourceStringsEN, false);
        }, this);
    }

    /**
     * Opens the banner
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
