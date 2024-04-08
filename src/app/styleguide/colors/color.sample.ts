import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-colors-sample',
    styleUrls: ['color.sample.scss'],
    templateUrl: 'color.sample.html',
    standalone: true,
    imports: [NgFor, NgIf]
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
            name: 'surface',
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
            name: 'success',
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
            name: 'info',
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
            name: 'warn',
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
            name: 'error',
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
        }
    ];
}
