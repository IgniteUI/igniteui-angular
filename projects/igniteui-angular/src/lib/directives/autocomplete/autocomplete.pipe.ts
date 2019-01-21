import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class IgxAutocompletePipe implements PipeTransform {
    public transform(collection: any[], condition = this.defaultCondition, term, key, groupKey) {
        return collection.filter(item => item[groupKey] || condition(key ? item[key] : item, term));
    }
    defaultCondition(value, term) {
        return value.toString().toLowerCase().startsWith(term.toString().toLowerCase());
    }
}
