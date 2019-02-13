import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISelectionEventArgs } from 'igniteui-angular';

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
    selector: 'app-select-form-sample',
    styleUrls: ['./select-form.sample.scss'],
    templateUrl: './select-form.sample.html'
})
export class SelectFormSampleComponent {
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
