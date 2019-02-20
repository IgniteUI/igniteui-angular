import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    ISelectionEventArgs, CancelableEventArgs, OverlaySettings,
    HorizontalAlignment, VerticalAlignment, scaleInTop, scaleOutBottom, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy,
    IgxSelectComponent
} from 'igniteui-angular';

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
    @ViewChildren(IgxSelectComponent) private selectComponents: QueryList<IgxSelectComponent>;

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

    public ngOnInit() {
        for (let i = 1; i < 10; i ++) {
            const item = { field: 'opt' + i };
            this.items.push(item);
        }
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
        this.selectComponents.first.toggle();
    }

    public handleOpen() {
        if (this.selectComponents.first.collapsed) {
            const customCloseOnOutsideClick = {
                closeOnOutsideClick: false
            };
            console.log('onOpen.....................:');
            this.selectComponents.first.open(customCloseOnOutsideClick);
        }
    }

    public handleClose() {
        if (!this.selectComponents.first.collapsed) {
            // console.log('onClose.....................: ');
            this.selectComponents.first.close();
        }
    }

    public toggleDisabled() {
        this.selectComponents.first.disabled = !this.selectComponents.first.disabled;
        // console.log('toggleDisabled.....................: ');
    }

    public openCustomOverlaySettings() {
        if (this.selectComponents.first.collapsed) {
            const positionSettings = {
                target: this.selectComponents.first.inputGroup.element.nativeElement,
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
            this.selectComponents.first.open(customOverlaySettings);
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
