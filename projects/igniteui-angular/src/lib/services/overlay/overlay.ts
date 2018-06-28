import { DOCUMENT } from '@angular/common';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { OverlaySettings, OverlayEventArgs, OverlayInfo } from './utilities';

import {
    ApplicationRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Inject,
    Injectable,
    Injector,
    Type
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata, AnimationFactory, AnimationPlayer } from '@angular/animations';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { IAnimationParams } from '../../animations/main';

@Injectable({ providedIn: 'root' })
export class IgxOverlayService {
    private _componentId = 0;
    private _overlayInfos: OverlayInfo[] = [];
    private _overlayElement: HTMLElement;

    private _defaultSettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };

    public onOpening = new EventEmitter<OverlayEventArgs>();
    public onOpened = new EventEmitter<OverlayEventArgs>();
    public onClosing = new EventEmitter<OverlayEventArgs>();
    public onClosed = new EventEmitter<OverlayEventArgs>();

    constructor(
        private _factoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector,
        private builder: AnimationBuilder,
        @Inject(DOCUMENT) private _document: any) { }

    show(component: ElementRef | Type<{}>, settings?: OverlaySettings): string {
        const id: string = (this._componentId++).toString();
        settings = Object.assign({}, this._defaultSettings, settings);

        const info = this.getOverlayInfo(component);

        //  if there is no info most probably wrong type component was provided and we just go out
        //  if show or hide players are in progress just return
        if (!info ||
            (info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) ||
            (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted())) {
            return;
        }

        info.id = id;
        info.settings = settings;

        this.onOpening.emit({ id, componentRef: info.componentRef });

        info.initialSize = info.elementRef.nativeElement.getBoundingClientRect();
        if (!info.componentRef) {
            info.hook = this.placeElementHook(info.elementRef.nativeElement);
        }

        this.moveElementToOverlay(info);
        this.updateSize(info);
        this._overlayInfos.push(info);

        settings.positionStrategy.position(info.elementRef.nativeElement.parentElement, info.initialSize, document, true);
        settings.scrollStrategy.initialize(this._document, this, id);
        settings.scrollStrategy.attach();
        this.addOutsideClickListener(info);

        this.playOpenAnimation(info);

        return id;
    }

    hide(id: string) {
        const info: OverlayInfo = this.getOverlayById(id);

        if (!info) {
            console.warn('igxOverlay.hide was called with wrong id: ' + id);
            return;
        }

        //  if show or hide players are in progress just return
        if ((info.openAnimationPlayer && info.openAnimationPlayer.hasStarted()) ||
            (info.closeAnimationPlayer && info.closeAnimationPlayer.hasStarted())) {
            return;
        }

        this.onClosing.emit({ id, componentRef: info.componentRef });
        info.settings.scrollStrategy.detach();
        this.removeOutsideClickListener(info);
        this.playCloseAnimation(info);
    }

    hideAll() {
        // since overlays are removed on animation done, que all hides
        for (let i = this._overlayInfos.length; i--;) {
            this.hide(this._overlayInfos[i].id);
        }
    }

    reposition(id: string) {
        const overlay = this.getOverlayById(id);
        if (!overlay) {
            console.error('Wrong id provided in overlay.reposition method. Id: ' + id);
            return;
        }

        overlay.settings.positionStrategy.position(
            overlay.elementRef.nativeElement.parentElement,
            overlay.initialSize,
            this._document);
    }

    private getOverlayInfo(component: any): OverlayInfo {
        const info: OverlayInfo = {};
        if (component instanceof ElementRef) {
            info.elementRef = <ElementRef>component;
        } else {
            let dynamicFactory: ComponentFactory<{}>;
            try {
                dynamicFactory = this._factoryResolver.resolveComponentFactory(component);
            } catch (error) {
                console.error(error);
                return null;
            }

            const dynamicComponent: ComponentRef<{}> = dynamicFactory.create(this._injector);
            this._appRef.attachView(dynamicComponent.hostView);

            // If the element is newly created from a Component, it is wrapped in 'ng-component' tag - we do not want that.
            const element = dynamicComponent.location.nativeElement.lastElementChild;
            info.elementRef = <ElementRef>{ nativeElement: element };
            info.componentRef = dynamicComponent;
        }

        return info;
    }

    private placeElementHook(element: HTMLElement): HTMLElement {
        const hook = this._document.createElement('div');
        element.parentElement.insertBefore(hook, element);
        return hook;
    }

    private moveElementToOverlay(info: OverlayInfo) {
        const wrapperElement = this.getWrapperElement();
        const contentElement = this.getContentElement(wrapperElement, info.settings);
        this.getOverlayElement().appendChild(wrapperElement);
        const elementScrollTop = info.elementRef.nativeElement.scrollTop;
        contentElement.appendChild(info.elementRef.nativeElement);

        if (elementScrollTop) {
            info.elementRef.nativeElement.scrollTop = elementScrollTop;
        }
    }

    private getWrapperElement(): HTMLElement {
        const wrapper: HTMLElement = this._document.createElement('div');
        wrapper.classList.add('igx-overlay__wrapper');
        return wrapper;
    }

    private getContentElement(wrapperElement: HTMLElement, settings: OverlaySettings): HTMLElement {
        const content: HTMLElement = this._document.createElement('div');
        if (settings.modal) {
            content.classList.add('igx-overlay__content--modal');
            content.addEventListener('click', (ev: Event) => {
                ev.stopPropagation();
            });
        } else {
            content.classList.add('igx-overlay__content');
        }

        content.addEventListener('scroll', (ev: Event) => {
            ev.stopPropagation();
        });

        wrapperElement.appendChild(content);
        return content;
    }

    private getOverlayElement(): HTMLElement {
        if (!this._overlayElement) {
            this._overlayElement = this._document.createElement('div');
            this._overlayElement.classList.add('igx-overlay');
            this._document.body.appendChild(this._overlayElement);
        }

        return this._overlayElement;
    }

    private updateSize(info: OverlayInfo) {
        if (info.componentRef) {
            //  if we are positioning component this is first time it gets visible
            //  and we can finally get its size
            info.initialSize = info.elementRef.nativeElement.getBoundingClientRect();
        }

        // set content div size only if element to show has size
        if (info.initialSize.width !== 0 && info.initialSize.height !== 0) {
            info.elementRef.nativeElement.parentElement.style.width = info.initialSize.width + 'px';
            info.elementRef.nativeElement.parentElement.style.height = info.initialSize.height + 'px';
        }
    }

    private addOutsideClickListener(info: OverlayInfo) {
        if (info.settings.closeOnOutsideClick) {
            if (info.settings.modal) {
                fromEvent(info.elementRef.nativeElement.parentElement.parentElement, 'click')
                    .pipe(take(1))
                    .subscribe(() => this.hide(info.id));
            } else if (
                //  if all overlays minus closing overlays equals one add the handler
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal).length -
                this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal &&
                    x.closeAnimationPlayer &&
                    x.closeAnimationPlayer.hasStarted()).length === 1) {
                (<HTMLElement>this._document).addEventListener('click', this.documentClicked, true);
            }
        }

    }

    private removeOutsideClickListener(info: OverlayInfo) {
        if (info.settings.modal === false) {
            let shouldRemoveClickEventListener = true;
            this._overlayInfos.forEach(o => {
                if (o.settings.modal === false && o.id !== info.id) {
                    shouldRemoveClickEventListener = false;
                }
            });

            if (shouldRemoveClickEventListener) {
                (<HTMLElement>this._document).removeEventListener('click', this.documentClicked, true);
            }
        }
    }

    // TODO: refactor playAnimation methods and allow null animations
    private playOpenAnimation(info: OverlayInfo) {

        const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.openAnimation);
        info.openAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

        if (info.settings.modal) {
            const wrapperElement = info.elementRef.nativeElement.parentElement.parentElement;
            fromEvent(wrapperElement, 'keydown')
                .pipe(take(1))
                .subscribe((ev: KeyboardEvent) => {
                    if (ev.key === 'Escape') {
                        this.hide(info.id);
                    }
                });

            wrapperElement.classList.remove('igx-overlay__wrapper');
            this.applyAnimationParams(wrapperElement, info.settings.positionStrategy.settings.openAnimation);
            wrapperElement.classList.add('igx-overlay__wrapper--modal');
        }

        info.openAnimationPlayer.onDone(() => {
            this.onOpened.emit({ id: info.id, componentRef: info.componentRef });
            info.openAnimationPlayer.reset();
            info.openAnimationPlayer = null;
        });

        info.openAnimationPlayer.play();
    }

    // TODO: refactor playAnimation methods and allow null animations
    private playCloseAnimation(info: OverlayInfo) {
        const animationBuilder = this.builder.build(info.settings.positionStrategy.settings.closeAnimation);
        info.closeAnimationPlayer = animationBuilder.create(info.elementRef.nativeElement);

        const child: HTMLElement = info.elementRef.nativeElement;
        if (info.settings.modal) {
            const parent = child.parentNode.parentNode as HTMLElement;
            parent.classList.remove('igx-overlay__wrapper--modal');
            parent.classList.add('igx-overlay__wrapper');
        }

        info.closeAnimationPlayer.onDone(() => {
            info.closeAnimationPlayer.reset();
            info.closeAnimationPlayer = null;
            if (!this._overlayElement.contains(child)) {
                console.warn('Component with id:' + info.id + ' is already removed!');
                return;
            }

            this._overlayElement.removeChild(child.parentNode.parentNode);
            if (info.componentRef) {
                this._appRef.detachView(info.componentRef.hostView);
                info.componentRef.destroy();
            }

            if (info.hook) {
                info.hook.parentElement.insertBefore(info.elementRef.nativeElement, info.hook);
                info.hook.parentElement.removeChild(info.hook);
            }

            if (info.settings.closeOnOutsideClick) {
                if (this._overlayInfos.filter(x => x.settings.closeOnOutsideClick && !x.settings.modal).length === 1) {
                    (<HTMLElement>this._document).removeEventListener('click', this.documentClicked, true);
                }
            }

            const index = this._overlayInfos.indexOf(info);
            this._overlayInfos.splice(index, 1);
            if (this._overlayInfos.length === 0 && this._overlayElement.parentElement) {
                this._overlayElement.parentElement.removeChild(this._overlayElement);
                this._overlayElement = null;
            }

            this.onClosed.emit({ id: info.id, componentRef: info.componentRef });
        });

        info.closeAnimationPlayer.play();
    }

    //  TODO: check if applyAnimationParams will work with complex animations
    private applyAnimationParams(wrapperElement: HTMLElement, animationOptions: AnimationReferenceMetadata) {
        if (!animationOptions || !animationOptions.options || !animationOptions.options.params) {
            return;
        }
        const params = animationOptions.options.params as IAnimationParams;
        if (params.duration) {
            wrapperElement.style.transitionDuration = params.duration;
        }
        if (params.easing) {
            wrapperElement.style.transitionTimingFunction = params.easing;
        }
    }

    private getOverlayById(id: string): OverlayInfo {
        const overlay = this._overlayInfos.find(e => e.id === id);
        return overlay;
    }

    private documentClicked = (ev: Event) => {
        for (let i = this._overlayInfos.length; i--;) {
            const info = this._overlayInfos[i];
            if (info.settings.modal) {
                return;
            }
            if (info.settings.closeOnOutsideClick) {
                if (!info.elementRef.nativeElement.contains(ev.target)) {
                    this.hide(info.id);
                    // TODO: should we return here too and not closing all no-modal overlays?
                }
            }
        }
    }
}
