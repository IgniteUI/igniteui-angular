import { 
    CommonModule,
    DatePipe
} from "@angular/common";
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    TemplateRef,
    ElementRef,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxInputModule } from "../directives/input/input.directive";
import { IgxToggleModule, IgxToggleDirective, IgxToggleActionDirective } from "../directives/toggle/toggle.directive";
import { IgxNavigationService } from "../core/navigation";

@Component({
    encapsulation: ViewEncapsulation.None,
    providers:
    [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxTimePickerComponent, multi: true }],
    selector: "igx-timepicker",
    styleUrls: ["time-picker.component.scss"],
    templateUrl: "time-picker.component.html"
})
export class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    // Custom formatter function
    @Input() public formatter: (val: Date) => string;

    @Input() public isDisabled = false;

    @Input() public value: Date;

    @Input() public itemsDelta = {hours: 0, minutes:30};

    @Input() public minValue: Date;

    @Input() public maxValue: Date;

    @Input() public dropDown = DROPDOWN.LIST;

    @Input() public format = "time";

    @Input() public locale: string;

    @Output() public onValueChanged = new EventEmitter<any>();

    public get displayTime() {
        if (this.value) {
            return this._formatDate(this.value);
        }

        return "";
    }

    public getDropDownItem(item: Date){
        return this._formatDate(item);
    }

    private _formatDate(date: Date){
        return this.datePipe.transform(date, this.format, null, this.locale);
    }

    dropDownItems = [];

    private _populateDropDown(){
        var minMinutes, maxMinutes;

        if (this.minValue) {
            minMinutes = this.minValue.getHours() * 60 + this.minValue.getMinutes();
        } else {
            minMinutes = 0;
        }
        if (this.maxValue) {
            maxMinutes = this.maxValue.getHours() * 60 + this.maxValue.getMinutes();
        } else {
            maxMinutes = 1440;
        }

        var timeDeltaMinutes = this.itemsDelta.hours * 60 + this.itemsDelta.minutes;
        var startMinutes = minMinutes / timeDeltaMinutes;
        var dropDownItemsCount = 0;

        if (timeDeltaMinutes > 0 && timeDeltaMinutes <= 1440) {
            dropDownItemsCount = 1440 / timeDeltaMinutes;
        }

        var initDate = new Date();
        initDate.setHours(0);
        initDate.setMinutes(0);
        initDate.setSeconds(0);

        for (var i = startMinutes; i < dropDownItemsCount; i++) {
            var date = new Date(initDate);
            date.setMinutes(timeDeltaMinutes * i);
            {
                if (timeDeltaMinutes * i >= minMinutes && timeDeltaMinutes * i <= maxMinutes) {
                this.dropDownItems.push(date);
                }
            }
        }
    }

    @ViewChild("listDropDown", { read: TemplateRef })
    protected listDropDown: TemplateRef<any>;

    @ViewChild("scrollDropDown", { read: TemplateRef })
    protected scrollDropDown: TemplateRef<any>;

    @ViewChild(IgxToggleDirective) toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) toggleAction: IgxToggleActionDirective;

    get dropdown() {
        if (this.dropDown === DROPDOWN.LIST) {
            if(this.navigationService) {
                this.toggleAction.target = this.navigationService.get("listToggle");
            }
            return this.listDropDown;
        }

        if(this.navigationService) {
            this.toggleAction.target = this.navigationService.get("scrollToggle");
        }
        
        return this.scrollDropDown;
    }    

    public onOpenEvent(event): void {
    }

    public ngOnInit(): void {
        this._populateDropDown();
    }

    public ngOnDestroy(): void {
    }

    public writeValue(value: Date) {
        this.value = value;
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    private _onTouchedCallback: () => void = () => {};

    private _onChangeCallback: (_: Date) => void = () => {};

    public onItemClicked(item) {
        this.value = item;
        this.onValueChanged.emit(item);
        this.toggle.close();
    }

    constructor(private navigationService: IgxNavigationService, private datePipe: DatePipe) {}
}

export enum DROPDOWN {
    LIST = "list",
    SCROLL = "scroll"
}

@NgModule({
    declarations: [IgxTimePickerComponent],
    exports: [IgxTimePickerComponent],
    imports: [CommonModule, IgxInputModule, IgxToggleModule],
    providers: [IgxNavigationService, DatePipe]
})
export class IgxTimePickerModule { }