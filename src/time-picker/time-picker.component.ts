import {
    CommonModule
} from "@angular/common";
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    HostBinding,
    HostListener,
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
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { IgxInputModule } from "../directives/input/input.directive";
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxHourItemDirective, IgxMinuteItemDirective, IgxAmPmItemDirective } from "./time-picker.directives"

export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

@Component({
    encapsulation: ViewEncapsulation.None,
    providers:[
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxTimePickerComponent,
            multi: true
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: TimePickerHammerConfig
        }
    ],
    selector: "igx-time-picker",
    templateUrl: "time-picker.component.html"
})
export class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input() public isDisabled = false;

    @Input() public okButtonLabel = "OK";

    @Input() public cancelButtonLabel = "Cancel";

    @Input() public value: Date;

    @Input() public itemsDelta = {hours: 1, minutes:1};

    @Input() public minValue: string;

    @Input() public maxValue: string;

    @Input() public vertical = true;

    @Input() public format = "hh:mm tt";

    @Output() public onValueChanged = new EventEmitter<any>();

    @Output() public onOKSelected = new EventEmitter<any>();

    @Output() public onOpen = new EventEmitter();

    @ViewChild("hourList") hourList: ElementRef;

    @ViewChild("minuteList") minuteList: ElementRef;

    @ViewChild("ampmList") ampmList: ElementRef;

    @ViewChild(IgxDialogComponent)
    public alert: IgxDialogComponent;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding("class")
    get styleClass(): string {
        if (this.vertical) {
            return "igx-time-picker";
        }
        return "igx-time-picker--horizontal";
    }

    public hourItems = [];
    public minuteItems = [];
    public ampmItems = [];

    public selectedHour: string;
    public selectedMinute: string;
    public selectedAmPm: string;

    private prevSelectedHour: string;
    private prevSelectedMinute: string;
    private prevSelectedAmPm: string;

    /**
     * @hidden
     */
    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();

        var listName = event.srcElement.className;
        var selectedHourIndex = this.hourItems.indexOf(this.selectedHour);
        var selectedMinuteIndex = this.minuteItems.indexOf(this.selectedMinute);
        var selectedAmPmIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex + 1 < this.hourItems.length - 3) {
            this.scrollHourIntoView(selectedHourIndex + 1);
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex + 1 < this.minuteItems.length - 3) {
            this.scrollMinuteIntoView(selectedMinuteIndex + 1);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex + 1 < this.ampmItems.length - 3) {
            this.scrollAmPmIntoView(selectedAmPmIndex + 1);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        var listName = event.srcElement.className;
        var selectedHourIndex = this.hourItems.indexOf(this.selectedHour);
        var selectedMinuteIndex = this.minuteItems.indexOf(this.selectedMinute);
        var selectedAmPmIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex > 3) {
            this.scrollHourIntoView(selectedHourIndex - 1);
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex > 3) {
            this.scrollMinuteIntoView(selectedMinuteIndex - 1);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex > 3) {
            this.scrollAmPmIntoView(selectedAmPmIndex - 1);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        var listName = event.srcElement.className;

        if (listName.indexOf("hourList") !== -1) {
            this.minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1 && this.ampmItems.length !== 0) {
            this.ampmList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();

        var listName = event.srcElement.className;

        if (listName.indexOf("minuteList") !== -1) {
            this.hourList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            this.minuteList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.enter", ["$event"])
    public onKeydownEnter(event: KeyboardEvent) {
        event.preventDefault();

        this.triggerOKSelection();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.escape", ["$event"])
    public onKeydownEscape(event: KeyboardEvent) {
        event.preventDefault();

        this.triggerCancelSelection();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.tab", ["$event"])
    public onKeydownTab(event: KeyboardEvent) {

        var listName = event.srcElement.className;

        if (listName.indexOf("hourList") !== -1) {
            event.preventDefault();
            this.minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1) {
            event.preventDefault();
            this.ampmList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            this.ampmList.nativeElement.blur();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.shift.tab", ["$event"])
    public onKeydownShiftTab(event: KeyboardEvent) {

        var listName = event.srcElement.className;

        if (listName.indexOf("minuteList") !== -1) {
            event.preventDefault();
            this.hourList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            event.preventDefault();
            this.minuteList.nativeElement.focus();
        } else if(event.srcElement.innerHTML.indexOf(this.cancelButtonLabel) !== -1) {
            event.preventDefault();
            this.ampmList.nativeElement.focus();
        }
    }

    public get displayTime() : string{
        if (this.value) {
            return this.formatTime(this.value, this.format);
        }

        return "";
    }

    public onClick(): void {
        if(this.selectedHour === undefined) {
            this.selectedHour = this.hourItems[3].toString();
        }
        if(this.selectedMinute === undefined) {
            this.selectedMinute = this.minuteItems[3].toString();
        }
        if(this.selectedAmPm === undefined && this.ampmItems !== null) {
            this.selectedAmPm = this.ampmItems[3];
        }

        this.prevSelectedHour = this.selectedHour;
        this.prevSelectedMinute = this.selectedMinute;
        this.prevSelectedAmPm = this.selectedAmPm;

        this.alert.open();
        this._onTouchedCallback();

        setTimeout(() => {
            if (this.selectedHour) {
                this.scrollHourIntoView(this.hourItems.indexOf(this.selectedHour));
                this.hourList.nativeElement.focus();
            }
            if (this.selectedMinute) {
                this.scrollMinuteIntoView(this.minuteItems.indexOf(this.selectedMinute));
            }
            if (this.selectedAmPm) {
                this.scrollAmPmIntoView(this.ampmItems.indexOf(this.selectedAmPm));
            }
        });

        this.onOpen.emit(this);
    }

    public ngOnInit(): void {
        this.generateHours();
        this.generateMinutes();
        if (this.format.indexOf("tt") !== -1) {
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
        if(item !== "") {
            this.scrollHourIntoView(this.hourItems.indexOf(item))
        }
    }

    public onMinuteClicked(item): void {
        if(item !== "") {
            this.scrollMinuteIntoView(this.minuteItems.indexOf(item));
        }
    }

    public onAmPmClicked(item): void {
        if(item !== "") {
            this.scrollAmPmIntoView(this.ampmItems.indexOf(item));
        }
    }

    private scrollHourIntoView(index): void {
        this.hourList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedHour = this.hourItems[index];
    }

    private scrollMinuteIntoView(index): void {
        this.minuteList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedMinute = this.minuteItems[index];
    }

    private scrollAmPmIntoView(index): void {
        this.ampmList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedAmPm = this.ampmItems[index];
    }

    public onHourWheel(event): void {
        var selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (event.deltaY > 0 ){
            this.nextHour();
        } else if (event.deltaY < 0) {
            this.prevHour();
        }
    }

    public onHourPan(event): void {
        var selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (event.deltaY < 0 ){
            this.nextHour();
        } else if (event.deltaY > 0) {
            this.prevHour();
        }
    }

    public onMinuteWheel(event): void {
        var selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY > 0 ){
            this.nextMinute();
        } else if (event.deltaY < 0) {
            this.prevMinute();
        }
    }

    public onMinutePan(event): void {
        var selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY < 0 ){
            this.nextMinute();
        } else if (event.deltaY > 0) {
            this.prevMinute();
        }
    }


    public onAmPmWheel(event): void {
        var selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY > 0 ){
            this.nextAmPm();
        } else if (event.deltaY < 0) {
            this.prevAmPm();
        }
    }

    public onAmPmPan(event): void {
        var selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY < 0 ){
            this.nextAmPm();
        } else if (event.deltaY > 0) {
            this.prevAmPm();
        }
    }

    public nextHour(){
        var selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (selectedIndex + 1 < this.hourItems.length - 3){
            this.scrollHourIntoView(selectedIndex + 1);
        }
    }

    public prevHour(){
        var selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (selectedIndex > 3) {
            this.scrollHourIntoView(selectedIndex - 1);
        }
    }

    public nextMinute(){
        var selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex + 1 < this.minuteItems.length - 3){
            this.scrollMinuteIntoView(selectedIndex + 1);
        }
    }

    public prevMinute(){
        var selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex > 3) {
            this.scrollMinuteIntoView(selectedIndex - 1);
        }
    }

    public nextAmPm(){
        var selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this.ampmItems.length - 3){
            this.scrollAmPmIntoView(selectedIndex + 1);
        }
    }

    public prevAmPm(){
        var selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex >3) {
            this.scrollAmPmIntoView(selectedIndex - 1);
        }
    }

    public onListHover(event): void {
        if (event.currentTarget.className.indexOf("hour") !== -1) {
            this.hourList.nativeElement.focus();
        } else if (event.currentTarget.className.indexOf("minute") !== -1) {
            this.minuteList.nativeElement.focus();
        } else {
            this.ampmList.nativeElement.focus();
        }
    }

    private formatTime(value: Date, format: string): string {
        if (value) {
            var hour = value.getHours();
            var minute = value.getMinutes();
            var formattedMinute;
            var formattedHour;

            if (format.indexOf("h") !== -1){
                var amPM = (hour > 11) ? "PM" : "AM";

                if (hour > 12) {
                    hour -= 12;
                    if (hour < 10 && format.indexOf("hh") !== -1){
                        formattedHour = "0" + hour;
                    } else {
                        formattedHour = hour.toString();
                    }
                } else if (hour == 0) {
                    formattedHour = "12";
                } else if (hour < 10 && format.indexOf("hh") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            } else {
                if (hour < 10 && format.indexOf("HH") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            }

            if(minute < 10 && format.indexOf("mm") !== -1) {
                formattedMinute = "0" + minute;
            } else {
                formattedMinute = minute.toString();
            }

            return format.replace("hh",formattedHour).replace("h",formattedHour)
                        .replace("HH",formattedHour).replace("H",formattedHour)
                        .replace("mm",formattedMinute).replace("m",formattedMinute)
                        .replace("tt",amPM);
        } else {
            return format;
        }
    }

    private addEmptyItems(items: string[]): void {
        for (var i = 0; i < 3; i++) {
            items.push("");
        }
    }

    private generateHours(): void {
        var hourItemsCount = 24;
        if (this.format.indexOf("h") !== -1) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours;

        var i;
        if (this.format.indexOf("H") !== -1) {
            i = 0;
        } else {
            i = 1;
        }

        this.addEmptyItems(this.hourItems);

        for (i; i < hourItemsCount; i++) {
            if (i * this.itemsDelta.hours < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1)) {
                this.hourItems.push("0" + (i * this.itemsDelta.hours).toString());
            }
            else {
                this.hourItems.push((i * this.itemsDelta.hours).toString());
            }
        }

        this.addEmptyItems(this.hourItems);
    }

    private generateMinutes(): void {
        var minuteItemsCount = 60 / this.itemsDelta.minutes;

        this.addEmptyItems(this.minuteItems);

        for (var i = 0; i < minuteItemsCount; i++) {
            if (i * this.itemsDelta.minutes < 10 && this.format.indexOf("mm") !== -1) {
                this.minuteItems.push("0" + (i * this.itemsDelta.minutes).toString());
            }
            else {
                this.minuteItems.push((i * this.itemsDelta.minutes).toString());
            }
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
        date.setSeconds(0);
        if(this.selectedAmPm === "PM" && this.selectedHour !== "12") {
            date.setHours(date.getHours() + 12)
        }
        if(this.selectedAmPm === "AM" && this.selectedHour === "12") {
            date.setHours(0);
        }
        return date;
    }

    private convertMinMaxValue(value: string): Date {
        var date = new Date();
        var sections = value.split(/[\s:]+/);

        date.setHours(parseInt(sections[0]));
        date.setMinutes(parseInt(sections[1]));
        date.setSeconds(0);
        if(sections[2] && sections[2] === "PM" && sections[0] !== "12") {
            date.setHours(date.getHours() + 12)
        }
        if(sections[2] && sections[2] && sections[0] === "12") {
            date.setHours(0);
        }

        return date;
    }

    private isValueValid(): boolean {
       if (this.maxValue && this.getSelectedTime() > this.convertMinMaxValue(this.maxValue)) {
            return false;
       } else if (this.minValue && this.getSelectedTime() < this.convertMinMaxValue(this.minValue)) {
            return false;
       } else {
           return true;
       }
    }

    public triggerOKSelection(): void {
        if (this.isValueValid()){
            this.alert.close()
            this.value = this.getSelectedTime();
            this.onValueChanged.emit(this.value);
        } else {
            this.onOKSelected.emit(this);
        }
    }

    public triggerCancelSelection(): void {
        this.alert.close()
        this.selectedHour = this.prevSelectedHour;
        this.selectedMinute = this.prevSelectedMinute;
        this.selectedAmPm = this.prevSelectedAmPm;
    }
}

@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxMinuteItemDirective,
        IgxAmPmItemDirective,
    ],
    exports: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxMinuteItemDirective,
        IgxAmPmItemDirective
    ],
    imports: [
        CommonModule,
        IgxInputModule,
        IgxDialogModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
