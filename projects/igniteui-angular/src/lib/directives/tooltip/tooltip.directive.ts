import {
    Directive, ElementRef, Input, ChangeDetectorRef, Optional, HostBinding, Inject,
    TemplateRef,
    ViewContainerRef, OnInit, OnDestroy, AfterViewInit,
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { HorizontalAlignment, OverlaySettings, VerticalAlignment } from '../../services/public_api';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective } from '../toggle/toggle.directive';
import { takeUntil } from 'rxjs';
import { TooltipCloseButtonComponent } from './tooltip-close-button.component';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Tooltip** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)
 *
 * The Ignite UI for Angular Tooltip directive is used to mark an HTML element in the markup as one that should behave as a tooltip.
 * The tooltip is used in combination with the Ignite UI for Angular Tooltip Target by assigning the exported tooltip reference to the
 * respective target's selector property.
 *
 * Example:
 * ```html
 * <button type="button" igxButton [igxTooltipTarget]="tooltipRef">Hover me</button>
 * <span #tooltipRef="tooltip" igxTooltip>Hello there, I am a tooltip!</span>
 * ```
 */
@Directive({
    exportAs: 'tooltip',
    selector: '[igxTooltip]',
    standalone: true
})
export class IgxTooltipDirective extends IgxToggleDirective implements OnInit, OnDestroy, AfterViewInit {
    private _arrowEl: HTMLElement;
    private _customCloseTemplate: TemplateRef<any>;
    private _disableArrow = false;
    private _sticky = false;
    private _offset = 6;

    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip--hidden')
    public override get hiddenClass() {
        return this.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-tooltip')
    public override get defaultClass() {
        return !this.collapsed;
    }

    /**
     * Gets/sets any tooltip related data.
     * The 'context' can be used for storing any information that is necessary
     * to access when working with the tooltip.
     *
     * ```typescript
     * // get
     * let tooltipContext = this.tooltip.context;
     * ```
     *
     * ```typescript
     * // set
     * this.tooltip.context = "Tooltip's context";
     * ```
     */
    @Input()
    public context;

    /**
     * Identifier for the tooltip.
     * If this is property is not explicitly set, it will be automatically generated.
     *
     * ```typescript
     * let tooltipId = this.tooltip.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public override id = `igx-tooltip-${NEXT_ID++}`;

    /**
     * Get the role attribute of the tooltip.
     *
     * ```typescript
     * let tooltipRole = this.tooltip.role;
     * ```
     */
    @HostBinding('attr.role')
    public get role() {
        return 'tooltip';
    }

    /**
     * @hidden
     */
    public timeoutId;

    /**
     * @hidden
     * Returns whether close time out has started
     */
    public toBeHidden = false;

    /**
     * @hidden
     * Returns whether open time out has started
     */
    public toBeShown = false;

    /** @hidden */
    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        @Optional() navigationService: IgxNavigationService,
        private viewContainerRef: ViewContainerRef) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(elementRef, cdr, overlayService, navigationService);
    }

    public override ngOnInit() {
        super.ngOnInit();
        this.createArrowElement();

        this.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this._arrowEl.style.display = this._disableArrow ? 'none' : 'block';
            this.positionArrow(this.overlayService.getOverlayById(this._overlayId).settings);
        });
    }


    public ngAfterViewInit() {
        if(this._sticky && !this._customCloseTemplate){
            this.appendDefaultCloseIcon();
        }
    }


    public override ngOnDestroy() {
        super.ngOnDestroy();
        this.removeArrow();
        this.removeCloseButton();
    }

    /**
     * If there is open animation in progress this method will finish is.
     * If there is no open animation in progress this method will open the toggle with no animation.
     *
     * @param overlaySettings setting to use for opening the toggle
     */
    protected forceOpen(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasOpenAnimation = info ? info.openAnimationPlayer : false;
        if (hasOpenAnimation) {
            info.openAnimationPlayer.finish();
            info.openAnimationPlayer.reset();
            info.openAnimationPlayer = null;
        } else if (this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.openAnimation;
            overlaySettings.positionStrategy.settings.openAnimation = null;
            this.open(overlaySettings);
            overlaySettings.positionStrategy.settings.openAnimation = animation;
        }
    }

    /**
     * If there is close animation in progress this method will finish is.
     * If there is no close animation in progress this method will close the toggle with no animation.
     *
     * @param overlaySettings settings to use for closing the toggle
     */
    protected forceClose(overlaySettings?: OverlaySettings) {
        const info = this.overlayService.getOverlayById(this._overlayId);
        const hasCloseAnimation = info ? info.closeAnimationPlayer : false;

        if (hasCloseAnimation) {
            info.closeAnimationPlayer.finish();
            info.closeAnimationPlayer.reset();
            info.closeAnimationPlayer = null;
        } else if (!this.collapsed) {
            const animation = overlaySettings.positionStrategy.settings.closeAnimation;
            overlaySettings.positionStrategy.settings.closeAnimation = null;
            this.close();
            overlaySettings.positionStrategy.settings.closeAnimation = animation;
        }
    }

    private setOffsetTooltip(settings: OverlaySettings) {
        const pos = settings.positionStrategy.settings;
        if (!pos) return;

        if (pos.verticalDirection === VerticalAlignment.Top) {
            this.setOffset(0, -this._offset);
        } else if (pos.verticalDirection === VerticalAlignment.Bottom) {
            this.setOffset(0, this._offset);
        } else if (pos.horizontalDirection === HorizontalAlignment.Left) {
            this.setOffset(this._offset, 0);
        } else if (pos.horizontalDirection === HorizontalAlignment.Right) {
            this.setOffset(-this._offset, 0);
        }
    }

    //TO DO:
    // Fix arrow flicker on animation played
    public positionArrow(settings?: OverlaySettings) {
        const pos = settings?.positionStrategy?.settings;
        if (!pos || !this._arrowEl) return;

        const style = this._arrowEl.style;
        const offset = 4;

        // Reset all directions and transforms
        style.top = '';
        style.bottom = '';
        style.left = '';
        style.right = '';
        style.transform = '';

        const set = (s: Partial<CSSStyleDeclaration>) => Object.assign(style, s);

        if (pos.verticalDirection === VerticalAlignment.Top) {
            set({
                bottom: `-${offset}px`,
                left: '50%',
                transform: 'translateX(-50%)'
            });
        } else if (pos.verticalDirection === VerticalAlignment.Bottom) {
            set({
                top: `-${offset}px`,
                left: '50%',
                transform: 'translateX(-50%)',
            });
        } else if (pos.horizontalDirection === HorizontalAlignment.Left) {
            set({
                right: `-${offset}px`,
                top: '50%',
                transform: 'translateY(-50%)'
            });
        } else if (pos.horizontalDirection === HorizontalAlignment.Right) {
            set({
                left: `-${offset}px`,
                top: '50%',
                transform: 'translateY(-50%)'
            });
        }
    }

    private createArrowElement() {
        this._arrowEl = document.createElement('div');
        this._arrowEl.classList.add('igx-tooltip--arrow');
        this._arrowEl.style.position = 'absolute';
        this._arrowEl.style.width = '8px';
        this._arrowEl.style.height = '8px';
        this._arrowEl.style.transform = 'rotate(45deg)';
        this._arrowEl.style.background = 'inherit';
        this.element.appendChild(this._arrowEl);
    }

    protected renderCustomCloseTemplate(): void {
        this.removeCloseButton();

        const view = this.viewContainerRef.createEmbeddedView(this._customCloseTemplate);
        view.detectChanges();

        for (const node of view.rootNodes) {
          if (node instanceof HTMLElement) {
            node.classList.add('close-button');
            this.element.appendChild(node);
          }
        }
    }

    protected appendDefaultCloseIcon(): void {
        this.removeCloseButton();
        const buttonRef = this.viewContainerRef.createComponent(TooltipCloseButtonComponent);
        buttonRef.instance.clicked.pipe(takeUntil(this.destroy$)).subscribe(() => this.close());
        this.element.appendChild(buttonRef.location.nativeElement);
    }

    private removeCloseButton(){
        const closeButton = this.element.querySelector('.close-button');
        if (closeButton) {
            closeButton.remove();
        }
    }

    private removeArrow() {
        this._arrowEl.remove();
        this._arrowEl = null;
    }
}
