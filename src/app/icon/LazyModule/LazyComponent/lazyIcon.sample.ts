import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IgxIconComponent } from '../../../../../projects/igniteui-angular/src/lib/icon/icon.component';

@Component({
    selector: 'app-lazy-icon-sample',
    styleUrls: ['./lazyIcon.sample.css'],
    templateUrl: 'lazyIcon.sample.html',
    standalone: true,
    imports: [IgxIconComponent]
})
export class LazyIconSampleComponent implements OnInit {
    constructor(private httpClient: HttpClient) {}

    // Used for testing the provided HttpsInterceptor
    // with lazy loaded modules
    public ngOnInit() {
        this.httpClient.get('../../../../assets/images/card/avatars/alicia_keys.jpg', { responseType: 'blob' }).subscribe((req) => {
            console.log(req);
        });
    }
}
