import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-lazy-icon-sample',
    styleUrls: ['./lazyIcon.sample.css'],
    templateUrl: 'lazyIcon.sample.html'
})
export class LazyIconSampleComponent implements OnInit {
    constructor(private httpClient: HttpClient) {}

    // Used for testing the provided HttpsInterceptor
    // with lazy loaded modules
    public ngOnInit() {
        this.httpClient.get('../../../../assets/images/card/avatars/alicia_keys.jpg').subscribe((req) => {
            console.log(req);
        });
    }
}
