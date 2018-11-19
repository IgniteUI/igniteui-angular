import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { ResourceStrings } from './resource-strings';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class IgxLocalizationService {

    private externalResourcesCache = new Set<any>();

    constructor(@Inject(LOCALE_ID) public locale: string, private http: HttpClient) {}

    public translate(key: string): string {
        let result;
        let rs;
        this.externalResourcesCache.forEach((resource) => {
            rs = resource[key];
            if (rs && resource[key][this.locale]) {
                result = resource[key][this.locale];
            }
        });

        if (result) {
            return result;
        }

        rs = ResourceStrings[key];
        if (rs) {
            if (this.locale.startsWith('jp')) {
                return rs.jp;
            } else if (this.locale.startsWith('ko')) {
                return rs.ko;
            } else {
                return rs.en;
            }
        } else {
            return key;
        }
    }

    public loadResourcesFromObject(resources: any): void {
        this.externalResourcesCache.add(resources);
    }

    public loadResourcesFromFile(filePath: string): void {
        this.http.get(filePath).subscribe(data => {
            this.loadResourcesFromObject(data);
        });
    }
}
