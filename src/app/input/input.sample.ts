import { Component } from '@angular/core';
import { IChangeRadioEventArgs } from 'igniteui-angular';

@Component({
    selector: 'app-input-sample',
    styleUrls: ['input.sample.css'],
    templateUrl: 'input.sample.html'
})
export class InputSampleComponent {
    placeholder = 'Please enter a value';
    selected: string;

    user = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: false,
        subscribed: false,
        dateOfBirth: new Date('07 July, 1987')
    };

    user2 = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: true,
        subscribed: false,
        dateOfBirth: new Date('01 July, 1954')
    };


    settings = [{
        name: 'WiFi',
        icon: 'wifi',
        active: true,
        disabled: false
    },
    {
        name: 'Bluetooth',
        icon: 'bluetooth',
        active: true,
        disabled: false
    }, {
        name: 'Device Visibility',
        icon: 'visibility',
        active: false,
        disabled: true
    }];

    onClick(event: MouseEvent) {
        console.log(event);
    }

    onChange(value: string) {
        console.log('changed radio selection');
        this.selected = value;
    }

    onRadioChanged(event: IChangeRadioEventArgs) {
        console.log(event);
    }

    selectSecond() {
        this.selected = 'option2';
    }
}
