import { Pipe, PipeTransform } from '@angular/core';
import { DataUtil } from 'igniteui-angular';

@Pipe({
    name: 'pagingPipe',
    pure: true
})
export class PagingPipe implements PipeTransform {

    public transform(collection: any[], page = 0, perPage = 15): any[] {
        const state = {
            index: page,
            recordsPerPage: perPage
        };
        const total = collection.length;
        const result = DataUtil.page(collection, state, total);
        return result;
    }
}
