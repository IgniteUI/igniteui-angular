import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, TemplateRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyChangeService } from '../properties-panel/property-change.service';
import {
    IgxDropDownComponent,
    OverlaySettings,
    IgxDragDirective,
    IgxOverlayService,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxLabelDirective,
    IgxButtonDirective,
    IgxRippleDirective,
    IgxDropDownItemComponent,
    RelativePositionStrategy,
    AbsolutePosition,
    RelativePosition,
    IgxToggleDirective
} from 'igniteui-angular';

@Component({
    selector: 'overlay-presets-sample',
    templateUrl: './overlay-presets.sample.html',
    styleUrls: ['overlay-presets.sample.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSelectComponent, IgxSelectItemComponent, FormsModule, IgxLabelDirective, IgxButtonDirective, IgxRippleDirective, IgxDragDirective, IgxDropDownComponent, IgxDropDownItemComponent, IgxToggleDirective]
})
export class OverlayPresetsSampleComponent implements AfterViewInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild(IgxDragDirective, { static: true })
    private igxDrag: IgxDragDirective;
    @ViewChild('containerTarget', { static: true, read: IgxToggleDirective })
    private containerTarget: IgxToggleDirective;
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');
    private readonly stageEl = viewChild.required<ElementRef>('stage');
    private readonly propertyChangeService = inject(PropertyChangeService);

    public items = [];
    public itemsCount = 10;
    public absStrategies = ['Global', 'Container'];
    public relStrategies = [RelativePositionStrategy.Auto, RelativePositionStrategy.Connected, RelativePositionStrategy.Elastic];
    public strategies = [...this.absStrategies, ...this.relStrategies];
    public positionStrategy = 'Global';
    public absPosition: AbsolutePosition = AbsolutePosition.Center;
    public absPositions = [AbsolutePosition.Center, AbsolutePosition.Top, AbsolutePosition.Bottom];
    public relPosition: RelativePosition;
    public relPositions = [
        RelativePosition.Above,
        RelativePosition.Below,
        RelativePosition.Before,
        RelativePosition.After,
        RelativePosition.Default
    ];

    private _overlaySettings: OverlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
    private xAddition = 0;
    private yAddition = 0;

    constructor() {
        for (let item = 0; item < this.itemsCount; item++) {
            this.items.push(`Item ${item}`);
        }
    }

    public isAbsoluteStrategy(): boolean {
        return this.absStrategies.includes(this.positionStrategy);
    }

    public onChange() {
        switch (this.positionStrategy) {
            case RelativePositionStrategy.Auto:
            case RelativePositionStrategy.Connected:
            case RelativePositionStrategy.Elastic:
                this.absPosition = null;
                this.relPosition = this.relPosition || RelativePosition.Default;
                this._overlaySettings = IgxOverlayService.createRelativeOverlaySettings(
                    this.button.nativeElement,
                    this.relPosition,
                    this.positionStrategy);
                break;
            case 'Global':
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
                break;
            case 'Container':
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition, true);
                break;
            default:
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings();
        }
    }

    public toggle() {
        if (this.positionStrategy === 'Global' || this.positionStrategy === 'Container') {
            this.containerTarget.toggle(this._overlaySettings);
        } else {
            this.igxDropDown.toggle(this._overlaySettings);
        }
    }

    public ngAfterViewInit(): void {
        this.propertyChangeService.setCustomControls(this.customControlsTemplate());
        this.propertyChangeService.setPanelTitle('Overlay Presets');
        this.centerToggleButton();
    }

    public onDragEnd(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const stageRect = this.stageEl().nativeElement.getBoundingClientRect();
        const left = originalEvent.clientX - stageRect.left - this.xAddition;
        const top = originalEvent.clientY - stageRect.top - this.yAddition;
        this.igxDrag.element.nativeElement.style.left = `${Math.max(0, left)}px`;
        this.igxDrag.element.nativeElement.style.top = `${Math.max(0, top)}px`;
    }

    public onDragStart(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const buttonRect = (originalEvent.target as HTMLElement).getBoundingClientRect();
        this.xAddition = originalEvent.clientX - buttonRect.left;
        this.yAddition = originalEvent.clientY - buttonRect.top;
    }

    private centerToggleButton(): void {
        const stageRect = this.stageEl().nativeElement.getBoundingClientRect();
        const buttonRect = this.igxDrag.element.nativeElement.getBoundingClientRect();
        this.igxDrag.element.nativeElement.style.left = `${(stageRect.width - buttonRect.width) / 2}px`;
        this.igxDrag.element.nativeElement.style.top = `${(stageRect.height - buttonRect.height) / 2}px`;
    }
}
