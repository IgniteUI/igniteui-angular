import { Component } from '@angular/core';

@Component({
    selector: 'app-colors-sample',
    styleUrls: ['color.sample.scss'],
    templateUrl: 'color.sample.html',
    imports: []
})
export class ColorsSampleComponent {
    public colors = [
        {
            name: 'primary',
            variants: [
                50,
                100,
                200,
                300,
                400,
                500,
                600,
                700,
                800,
                900,
                'A100',
                'A200',
                'A400',
                'A700'
            ]
        },
        {
            name: 'secondary',
            variants: [
                50,
                100,
                200,
                300,
                400,
                500,
                600,
                700,
                800,
                900,
                'A100',
                'A200',
                'A400',
                'A700'
            ]
        },
        {
            name: 'gray',
            variants: [
                50,
                100,
                200,
                300,
                400,
                500,
                600,
                700,
                800,
                900
            ]
        },
        {
            name: 'success',
            variants: [500]
        },
        {
            name: 'info',
            variants: [500]
        },
        {
            name: 'warn',
            variants: [500]
        },
        {
            name: 'error',
            variants: [500]
        }
    ];
}
