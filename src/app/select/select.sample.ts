
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    ISelectionEventArgs, CancelableEventArgs, OverlaySettings,
    HorizontalAlignment, VerticalAlignment, scaleInTop, scaleOutBottom, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy,
    IgxSelectComponent
} from 'igniteui-angular';
import { SelectPositioningStrategy } from 'projects/igniteui-angular/src/lib/select/select-positioning-strategy';

let counter = 0;
class Person {
    favoriteFood: string;

    constructor(public name: string, season?: string) {
        if (season) {
            this.favoriteFood = season;
        }
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select.sample.scss'],
    templateUrl: './select.sample.html'
})
export class SelectSampleComponent implements OnInit {

    @ViewChild(IgxSelectComponent) public igxSelect: IgxSelectComponent;

    mySelectForm: FormGroup;
    newUser: Person;

    public users: Person [] = [
        { name: 'Maria', favoriteFood: 'Steak' },
        { name: 'Doe', favoriteFood: 'Pizza' },
        { name: 'Anton', favoriteFood: 'Apples' }
];

    constructor(private _formBuilder: FormBuilder) {
        this._createMySelectForm();
    }

    public newUsers: Person [] = [
        { name: 'Tanya', favoriteFood: 'Tomatoes' },
        { name: 'Alex', favoriteFood: 'Salami' },
        { name: 'Petur', favoriteFood: 'Spaghetti' }
    ];

    public items: any[] = [];

    public value: 'opt1';
    public disabledItemValue: 'InsideGroup1';
    public customOverlaySettings: OverlaySettings;

    public ngOnInit() {
        for (let i = 1; i < 10; i ++) {
            const item = { field: 'opt' + i };
            this.items.push(item);
        }
        const positionSettings = {
            target: this.igxSelect.inputGroup.element.nativeElement,
            horizontalDirection: HorizontalAlignment.Right,
            verticalDirection: VerticalAlignment.Bottom,
            horizontalStartPoint: HorizontalAlignment.Left,
            verticalStartPoint: VerticalAlignment.Bottom,
            openAnimation: scaleInTop,
            closeAnimation: scaleOutBottom
        };

        const customOverlaySettings = {
            modal: true,
            closeOnOutsideClick: false,
            positionStrategy: new ConnectedPositioningStrategy(
                positionSettings
            ),
            scrollStrategy: new AbsoluteScrollStrategy()
        };
        this.customOverlaySettings = customOverlaySettings;
    }

    public testOnSelection(evt: ISelectionEventArgs) {
        //  console.log('testOnSelection.....................' + evt.cancel);
    }

    public testOnOpening(evt: CancelableEventArgs) {
        // console.log('testOnOpening.....................: ' + evt.cancel);
    }

    public testOnOpened() {
        // console.log('testOnOpened.....................: ');
    }

    public testOnClosing(evt: CancelableEventArgs) {
        // console.log('testOnClosing.....................: ' + evt.cancel);
    }

    public testOnClosed() {
        // console.log('testOnClosed.....................: ');
    }

    public handleToggle() {
        // console.log('handleToggle.....................: ');
        this.igxSelect.toggle();
    }

    public handleOpen() {
        if (this.igxSelect.collapsed) {
            const customCloseOnOutsideClick = {
                modal: false,
                closeOnOutsideClick: false,
                positionStrategy: new SelectPositioningStrategy(
                    this.igxSelect
                ),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            console.log('onOpen.....................:');
            this.igxSelect.open(customCloseOnOutsideClick);
        }
    }

    public handleClose() {
        if (!this.igxSelect.collapsed) {
            // console.log('onClose.....................: ');
            this.igxSelect.close();
        }
    }

    public toggleDisabled() {
        this.igxSelect.disabled = !this.igxSelect.disabled;
        // console.log('toggleDisabled.....................: ');
    }

    public openCustomOverlaySettings() {
        if (this.igxSelect.collapsed) {
            const positionSettings = {
                target: this.igxSelect.inputGroup.element.nativeElement,
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
                openAnimation: scaleInTop,
                closeAnimation: scaleOutBottom
            };

            const customOverlaySettings = {
                modal: true,
                closeOnOutsideClick: false,
                positionStrategy: new ConnectedPositioningStrategy(
                    positionSettings
                ),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            console.log('onOpenCustomOverlaySettings.....................:  customOverlaySettings');
            this.igxSelect.open(customOverlaySettings);
        }
    }


    onUpdateSelect() {
        if (counter > 2) {
            return;
        }
        this.users.push(this.newUsers[counter]);
        this.mySelectForm.setValue({
            name: this.users[this.users.length - 1].name,
            favoriteFood: this.users[this.users.length - 1].favoriteFood
        });
        this.newUser = this.users[this.users.length - 1];
        counter++;
    }

    private _createMySelectForm() {
        this.mySelectForm = this._formBuilder.group({
            name: '',
            favoriteFood: ''
        });

        this.mySelectForm.setValue({
            name: this.users[0].name,
            favoriteFood: this.users[0].favoriteFood
        });

        // Subscribe to ngForm valueChanges
        this.mySelectForm.get('name').valueChanges.subscribe(val => {
            console.log(`valueChanges name: ${val}`);
        });
        this.mySelectForm.get('favoriteFood').valueChanges.subscribe(val => {
            console.log(`valueChanges favoriteFood: ${val}`);
        });
    }

    public handleInputName (event) {
        if (event) {
            const user = this.users.find(x => x.name === event.target.value);
            this.mySelectForm.setValue({name: user.name , favoriteFood: user.favoriteFood});
        }
    }

    public handleInputFood (event) {
        if (event) {
            const user = this.users.find(x => x.favoriteFood === event.target.value);
            this.mySelectForm.setValue({name: user.name , favoriteFood: user.favoriteFood});
        }
    }

    public handleOnNameSelection (event: ISelectionEventArgs) {
        if (event.newSelection) {
            const user = this.users.find(x => x.name === event.newSelection.value);
            this.mySelectForm.setValue({name: user.name , favoriteFood: user.favoriteFood});
        }
    }

    public handleOnFoodSelection (event: ISelectionEventArgs) {
        if (event.newSelection) {
            const user = this.users.find(x => x.favoriteFood === event.newSelection.value);
            this.mySelectForm.setValue({name: user.name , favoriteFood: user.favoriteFood});
        }
    }

    onSubmit() {
        console.table(this.mySelectForm.value);
    }
}
