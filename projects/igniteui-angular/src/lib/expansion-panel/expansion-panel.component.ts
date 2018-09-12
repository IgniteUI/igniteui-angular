import { element } from 'protractor';
import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    Input,
    Output,
    ViewChild,
    ContentChild,
} from '@angular/core';
import { AnimationBuilder, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { growVerOut, growVerIn } from '../animations/main';
import { IgxExpansionPanelTitleDirective } from './expansion-panel.directives';
import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';

let NEXT_ID = 0;

@Component({
    selector: 'igx-expansion-panel',
    templateUrl: 'expansion-panel.component.html'
})
export class IgxExpansionPanelComponent {
    private _title: string;

    @Input()
    public animationSettings: { openAnimation: AnimationReferenceMetadata, closeAnimation: AnimationReferenceMetadata } = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    /**
     * Sets/gets the `id` of the expansion panel component.
     * If not set, `id` will have value `"igx-expansion-panel-0"`;
     * ```html
     * <igx-expansion-panel id = "my-first-expansion-panel"></igx-expansion-panel>
     * ```
     * ```typescript
     * let panelId =  this.panel.id;
     * ```
     * @memberof IgxExpansionPanelComponent
     */

    @HostBinding('attr.id')
    @Input()
    public id = `igx-expansion-panel-${NEXT_ID++}`;

    @HostBinding('class.igx-expansion-panel')
    public cssClass = 'igx-expansion-panel';

    @Input()
    public collapsed = true;

    @Output()
    public onCollapsed = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<any>();

    constructor(
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        private builder: AnimationBuilder) { }

    @ContentChild(IgxExpansionPanelBodyComponent, { read: IgxExpansionPanelBodyComponent })
    private body: IgxExpansionPanelBodyComponent;

    @ContentChild(IgxExpansionPanelTitleDirective, { read: IgxExpansionPanelTitleDirective })
    public title: IgxExpansionPanelTitleDirective;

    @Input()
    public label = '';

    @Input()
    public set labelledby(val: string) {
        this._title = val;
    }

    public get labelledby(): string {
        return this.title ? this.title.id : this._title;
    }

    private playOpenAnimation(cb: () => void) {
        const animation = useAnimation(this.animationSettings.openAnimation);
        const animationBuilder = this.builder.build(animation);
        const openAnimationPlayer = animationBuilder.create(this.body.element.nativeElement.firstElementChild);

        openAnimationPlayer.onDone(() => {
            cb();
            openAnimationPlayer.reset();
        });

        openAnimationPlayer.play();
    }

    private playCloseAnimation(cb: () => void) {
        const animation = useAnimation(this.animationSettings.closeAnimation);
        const animationBuilder = this.builder.build(animation);
        const closeAnimationPlayer = animationBuilder.create(this.body.element.nativeElement.firstElementChild);
        closeAnimationPlayer.onDone(() => {
            cb();
            closeAnimationPlayer.reset();
        });

        closeAnimationPlayer.play();
    }

    collapse(evt?: Event) {
        this.playCloseAnimation(
            () => {
                this.onCollapsed.emit({ event: evt });
                this.collapsed = true;
            }
        );
    }

    expand(evt?: Event) {
        this.collapsed = false;
        this.cdr.detectChanges();
        this.playOpenAnimation(
            () => {
                this.onExpanded.emit({ event: evt });
            }
        );
    }

    toggle(evt?: Event) {
        if (this.collapsed) {
            this.expand(evt);
        } else {
            this.collapse(evt);
        }
    }
}

