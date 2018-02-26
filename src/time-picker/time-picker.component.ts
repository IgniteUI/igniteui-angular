import { 
    CommonModule
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
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxTimeFormatPipe } from "./time-picker-pipes";

@Component({
    encapsulation: ViewEncapsulation.None,
    providers:
    [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxTimePickerComponent, multi: true }],
    selector: "igx-time-picker",
    styleUrls: ["time-picker.component.scss"],
    templateUrl: "time-picker.component.html"
})
export class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    // Custom formatter function
    @Input() public formatter: (val: Date) => string;

    @Input() public isDisabled = false;

    @Input() public okButtonLabel = "OK";

    @Input() public cancelButtonLabel = "Cancel";

    @Input() public value: Date;

    @Input() public visibleItemsCount = 7;

    @Input() public itemsDelta = {hours: 1, minutes:1};

    @Input() public minValue: Date;

    @Input() public maxValue: Date;

    @Input() public vertical = false;

    @Input() public format = "hh:mm tt";

    @HostBinding("class") class = "igx-time-picker";

    @HostBinding("class")
    get styleClass(): string {
        if (this.vertical) {
            return "igx-time-picker--vertical";
        }
        return "igx-time-picker";
    }

    @Output() public onValueChanged = new EventEmitter<any>();

    @Output() public onOpen = new EventEmitter();

    @ViewChild("hourList") hourList: ElementRef;

    @ViewChild("minuteList") minuteList: ElementRef;

    @ViewChild("ampmList") ampmList: ElementRef;
    
    @ViewChild(IgxDialogComponent)
    public alert: IgxDialogComponent;

    public hourItems = [];
    public minuteItems = [];
    public ampmItems = [];

    public selectedHour: string;
    public selectedMinute: string;
    public selectedAmPm: string;

    private prevSelectedHour: string;
    private prevSelectedMinute: string;
    private prevSelectedAmPm: string;

    public get displayTime() : string{
        if (this.value) {
            return this.formatTime(this.value);
        }

        return "";
    }

    public formatTime(date: Date): string {
        return this.timePipe.transform(date, this.format);
    }

    public onOpenEvent(event): void {
        if(this.selectedHour === undefined) {
            this.selectedHour = this.hourItems[Math.floor(this.visibleItemsCount/2)].toString();
        }
        if(this.selectedMinute === undefined) {
            this.selectedMinute = this.minuteItems[Math.floor(this.visibleItemsCount/2)].toString();
        }
        if(this.selectedAmPm === undefined && this.ampmItems !== null) {
            this.selectedAmPm = this.ampmItems[Math.floor(this.visibleItemsCount/2)];
        }

        this.prevSelectedHour = this.selectedHour;
        this.prevSelectedMinute = this.selectedMinute;
        this.prevSelectedAmPm = this.selectedAmPm;

        this.alert.open();
        this._onTouchedCallback();

        setTimeout(() => {
            if (this.selectedHour) {
                this.hourList.nativeElement.children[this.hourItems.indexOf(this.selectedHour)].scrollIntoView({block: "center"});
            }
            if (this.selectedMinute) {
                this.minuteList.nativeElement.children[this.minuteItems.indexOf(this.selectedMinute)].scrollIntoView({block: "center"});

                this.addSelectedStyle(this.minuteList.nativeElement.children[this.minuteItems.indexOf(this.selectedMinute)]);
            }
            if (this.selectedAmPm) {
                this.ampmList.nativeElement.children[this.ampmItems.indexOf(this.selectedAmPm)].scrollIntoView({block: "center"});
            }
        }, 1);

        this.onOpen.emit(this);
    }

    public ngOnInit(): void {
        this.generateHours();
        this.generateMinutes();
        if (this.format.includes("tt")) {
            this.generateAmPm();
        }
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

    public onHourClicked(item): void {
        this.selectedHour = item;
        this.hourList.nativeElement.children[this.hourItems.indexOf(item)].scrollIntoView({block: "center"});
    }
    public onMinuteClicked(item): void {

        this.removeSelectedStyle(this.minuteList.nativeElement.children[this.minuteItems.indexOf(this.selectedMinute)]);

        this.selectedMinute = item;
        this.minuteList.nativeElement.children[this.minuteItems.indexOf(item)].scrollIntoView({block: "center"});

        this.addSelectedStyle(this.minuteList.nativeElement.children[this.minuteItems.indexOf(item)]);
    }

    public onAmPmClicked(item): void {        
        this.selectedAmPm = item;
        this.ampmList.nativeElement.children[this.ampmItems.indexOf(item)].scrollIntoView({block: "center"});
    }

    public onHourWheel(event): void {
        var selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (event.deltaY > 0 && selectedIndex + 1 < this.hourItems.length - Math.floor(this.visibleItemsCount / 2)){
            this.hourList.nativeElement.children[selectedIndex + 1].scrollIntoView({block: "center"});
            this.selectedHour = this.hourItems[selectedIndex + 1];
        } else if (event.deltaY < 0 && selectedIndex > Math.floor(this.visibleItemsCount / 2)) {
            this.hourList.nativeElement.children[selectedIndex - 1].scrollIntoView({block: "center"});
            this.selectedHour = this.hourItems[selectedIndex - 1];
        }        
    }

    public onMinuteWheel(event): void {
        var selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY > 0 && selectedIndex + 1 < this.minuteItems.length - Math.floor(this.visibleItemsCount / 2)){
            this.minuteList.nativeElement.children[selectedIndex + 1].scrollIntoView({block: "center"});

            this.addSelectedStyle(this.minuteList.nativeElement.children[selectedIndex + 1]);
            this.removeSelectedStyle(this.minuteList.nativeElement.children[selectedIndex]);

            this.selectedMinute = this.minuteItems[selectedIndex + 1];
        } else if (event.deltaY < 0 && selectedIndex > Math.floor(this.visibleItemsCount / 2)) {
            this.minuteList.nativeElement.children[selectedIndex - 1].scrollIntoView({block: "center"});

            this.addSelectedStyle(this.minuteList.nativeElement.children[selectedIndex - 1]);
            this.removeSelectedStyle(this.minuteList.nativeElement.children[selectedIndex]);

            this.selectedMinute = this.minuteItems[selectedIndex - 1];
        }        
    }

    public onAmPmWheel(event): void {
        var selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY > 0 && selectedIndex + 1 < this.ampmItems.length - Math.floor(this.visibleItemsCount / 2)){
            this.ampmList.nativeElement.children[selectedIndex + 1].scrollIntoView({block: "center"});
            this.selectedAmPm = this.ampmItems[selectedIndex + 1];
        } else if (event.deltaY < 0 && selectedIndex > Math.floor(this.visibleItemsCount/2)) {
            this.ampmList.nativeElement.children[selectedIndex - 1].scrollIntoView({block: "center"});
            this.selectedAmPm = this.ampmItems[selectedIndex - 1];
        }        
    }

    private addSelectedStyle(listItem: any): void {
        listItem.classList.add("selected");
    }

    private removeSelectedStyle(listItem: any): void {
        listItem.classList.remove("selected");
    }

    private addEmptyItems(items: string[]): void {
        for (var i = 0; i < Math.floor(this.visibleItemsCount/2); i++) {
            items.push("");
        }
    }

    private generateHours(): void {
        var hourItemsCount = 24;
        if (this.format.includes("h")) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours; 

        this.addEmptyItems(this.hourItems);

        var i;
        if (this.format.includes("H")) {
            i = 0;
        } else {
            i = 1;
        }

        for (i; i < hourItemsCount; i++) {
            if (i < 10 && (this.format.includes("hh") || this.format.includes("HH"))) {
                this.hourItems.push("0" + i.toString());
            }
            else
            this.hourItems.push(i.toString());
        }

        this.addEmptyItems(this.hourItems);
    }

    private generateMinutes(): void {
        var minuteItemsCount = 60 / this.itemsDelta.minutes; 

        this.addEmptyItems(this.minuteItems);

        for (var i = 0; i < minuteItemsCount; i++) {
            if (i < 10 && this.format.includes("mm")) {
                this.minuteItems.push("0" + i.toString());
            }
            else
            this.minuteItems.push(i.toString());
        }

        this.addEmptyItems(this.minuteItems);
    }

    private generateAmPm(): void {

        this.addEmptyItems(this.ampmItems);

        this.ampmItems.push("AM");
        this.ampmItems.push("PM");

        this.addEmptyItems(this.ampmItems);
    }

    private getSelectedTime(): Date {
        var date = new Date();
        date.setHours(parseInt(this.selectedHour));
        date.setMinutes(parseInt(this.selectedMinute));
        if(this.selectedAmPm === "PM" && this.selectedHour !== "12") {
            date.setHours(date.getHours() + 12)
        }
        if(this.selectedAmPm === "AM" && this.selectedHour === "12") {
            date.setHours(0);
        }
        return date;
    }

    public triggerOKSelection(): void {
        this.alert.close()
        this.value = this.getSelectedTime();
        this.onValueChanged.emit(this.value);
    }

    public triggerCancelSelection(): void {
        this.alert.close()
        this.selectedHour = this.prevSelectedHour;
        this.selectedMinute = this.prevSelectedMinute;
        this.selectedAmPm = this.prevSelectedAmPm;
    }

    constructor(private timePipe: IgxTimeFormatPipe) {}
}

@NgModule({
    declarations: [IgxTimePickerComponent, IgxTimeFormatPipe],
    exports: [IgxTimePickerComponent],
    imports: [CommonModule, IgxInputModule, IgxDialogModule],
    providers: [IgxTimeFormatPipe]
})
export class IgxTimePickerModule { }