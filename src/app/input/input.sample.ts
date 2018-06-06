import { Component } from '@angular/core';

@Component({
    selector: 'app-input-sample',
    styleUrls: ['input.sample.css'],
    templateUrl: 'input.sample.html'
})
export class InputSampleComponent {
    placeholder = 'Please enter a value';

    user = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: false,
        subscribed: false
    };

    user2 = {
        comment: '',
        firstName: 'John',
        gender: 'Male',
        lastName: 'Doe',
        password: '1337s3cr3t',
        registered: true,
        subscribed: false
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

    onClick(event) {
        console.log(event);
    }

    onChange(event) {
        console.log(event);
    }
}
