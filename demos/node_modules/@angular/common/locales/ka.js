/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/ka", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'ka', [['a', 'p'], ['AM', 'PM'], u],
        [['AM', 'PM'], u, ['AM', 'შუადღ. შემდეგ']],
        [
            ['კ', 'ო', 'ს', 'ო', 'ხ', 'პ', 'შ'],
            ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
            [
                'კვირა', 'ორშაბათი', 'სამშაბათი',
                'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი',
                'შაბათი'
            ],
            ['კვ', 'ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ']
        ],
        u,
        [
            ['ი', 'თ', 'მ', 'ა', 'მ', 'ი', 'ი', 'ა', 'ს', 'ო', 'ნ', 'დ'],
            [
                'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ',
                'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
            ],
            [
                'იანვარი', 'თებერვალი', 'მარტი',
                'აპრილი', 'მაისი', 'ივნისი', 'ივლისი',
                'აგვისტო', 'სექტემბერი', 'ოქტომბერი',
                'ნოემბერი', 'დეკემბერი'
            ]
        ],
        u,
        [
            ['ძვ. წ.', 'ახ. წ.'], u,
            [
                'ძველი წელთაღრიცხვით',
                'ახალი წელთაღრიცხვით'
            ]
        ],
        1, [6, 0], ['dd.MM.yy', 'd MMM. y', 'd MMMM, y', 'EEEE, dd MMMM, y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1}, {0}', u, u, u],
        [
            ',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞',
            'არ არის რიცხვი', ':'
        ],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '₾', 'ქართული ლარი', {
            'AUD': [u, '$'],
            'CNY': [u, '¥'],
            'GEL': ['₾'],
            'HKD': [u, '$'],
            'ILS': [u, '₪'],
            'INR': [u, '₹'],
            'JPY': [u, '¥'],
            'KRW': [u, '₩'],
            'NZD': [u, '$'],
            'TWD': ['NT$'],
            'USD': ['US$', '$'],
            'VND': [u, '₫']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2EuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9rYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDMUM7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNuQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNqRDtnQkFDRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVc7Z0JBQ2hDLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVztnQkFDckMsUUFBUTthQUNUO1lBQ0QsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7U0FDM0M7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVEO2dCQUNFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7Z0JBQy9DLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO2FBQ2xDO1lBQ0Q7Z0JBQ0UsU0FBUyxFQUFFLFdBQVcsRUFBRSxPQUFPO2dCQUMvQixRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRO2dCQUNyQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFdBQVc7Z0JBQ3BDLFVBQVUsRUFBRSxXQUFXO2FBQ3hCO1NBQ0Y7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3ZCO2dCQUNFLHFCQUFxQjtnQkFDckIscUJBQXFCO2FBQ3RCO1NBQ0Y7UUFDRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQztRQUNwRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNFO1lBQ0UsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUNoRCxnQkFBZ0IsRUFBRSxHQUFHO1NBQ3RCO1FBQ0QsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFO1lBQ2pFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1NBQ2hCO1FBQ0QsTUFBTTtLQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAna2EnLCBbWydhJywgJ3AnXSwgWydBTScsICdQTSddLCB1XSxcbiAgW1snQU0nLCAnUE0nXSwgdSwgWydBTScsICfhg6jhg6Phg5Dhg5Phg6YuIOGDqOGDlOGDm+GDk+GDlOGDkiddXSxcbiAgW1xuICAgIFsn4YOZJywgJ+GDnScsICfhg6EnLCAn4YOdJywgJ+GDricsICfhg54nLCAn4YOoJ10sXG4gICAgWyfhg5nhg5Xhg5gnLCAn4YOd4YOg4YOoJywgJ+GDoeGDkOGDmycsICfhg53hg5fhg64nLCAn4YOu4YOj4YOXJywgJ+GDnuGDkOGDoCcsICfhg6jhg5Dhg5EnXSxcbiAgICBbXG4gICAgICAn4YOZ4YOV4YOY4YOg4YOQJywgJ+GDneGDoOGDqOGDkOGDkeGDkOGDl+GDmCcsICfhg6Hhg5Dhg5vhg6jhg5Dhg5Hhg5Dhg5fhg5gnLFxuICAgICAgJ+GDneGDl+GDruGDqOGDkOGDkeGDkOGDl+GDmCcsICfhg67hg6Phg5fhg6jhg5Dhg5Hhg5Dhg5fhg5gnLCAn4YOe4YOQ4YOg4YOQ4YOh4YOZ4YOU4YOV4YOYJyxcbiAgICAgICfhg6jhg5Dhg5Hhg5Dhg5fhg5gnXG4gICAgXSxcbiAgICBbJ+GDmeGDlScsICfhg53hg6AnLCAn4YOh4YObJywgJ+GDneGDlycsICfhg67hg5cnLCAn4YOe4YOgJywgJ+GDqOGDkSddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ+GDmCcsICfhg5cnLCAn4YObJywgJ+GDkCcsICfhg5snLCAn4YOYJywgJ+GDmCcsICfhg5AnLCAn4YOhJywgJ+GDnScsICfhg5wnLCAn4YOTJ10sXG4gICAgW1xuICAgICAgJ+GDmOGDkOGDnCcsICfhg5fhg5Thg5EnLCAn4YOb4YOQ4YOgJywgJ+GDkOGDnuGDoCcsICfhg5vhg5Dhg5gnLCAn4YOY4YOV4YOcJywgJ+GDmOGDleGDmicsXG4gICAgICAn4YOQ4YOS4YOVJywgJ+GDoeGDlOGDpScsICfhg53hg6Xhg6InLCAn4YOc4YOd4YOUJywgJ+GDk+GDlOGDmSdcbiAgICBdLFxuICAgIFtcbiAgICAgICfhg5jhg5Dhg5zhg5Xhg5Dhg6Dhg5gnLCAn4YOX4YOU4YOR4YOU4YOg4YOV4YOQ4YOa4YOYJywgJ+GDm+GDkOGDoOGDouGDmCcsXG4gICAgICAn4YOQ4YOe4YOg4YOY4YOa4YOYJywgJ+GDm+GDkOGDmOGDoeGDmCcsICfhg5jhg5Xhg5zhg5jhg6Hhg5gnLCAn4YOY4YOV4YOa4YOY4YOh4YOYJyxcbiAgICAgICfhg5Dhg5Lhg5Xhg5jhg6Hhg6Lhg50nLCAn4YOh4YOU4YOl4YOi4YOU4YOb4YOR4YOU4YOg4YOYJywgJ+GDneGDpeGDouGDneGDm+GDkeGDlOGDoOGDmCcsXG4gICAgICAn4YOc4YOd4YOU4YOb4YOR4YOU4YOg4YOYJywgJ+GDk+GDlOGDmeGDlOGDm+GDkeGDlOGDoOGDmCdcbiAgICBdXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ+GDq+GDlS4g4YOsLicsICfhg5Dhg64uIOGDrC4nXSwgdSxcbiAgICBbXG4gICAgICAn4YOr4YOV4YOU4YOa4YOYIOGDrOGDlOGDmuGDl+GDkOGDpuGDoOGDmOGDquGDruGDleGDmOGDlycsXG4gICAgICAn4YOQ4YOu4YOQ4YOa4YOYIOGDrOGDlOGDmuGDl+GDkOGDpuGDoOGDmOGDquGDruGDleGDmOGDlydcbiAgICBdXG4gIF0sXG4gIDEsIFs2LCAwXSwgWydkZC5NTS55eScsICdkIE1NTS4geScsICdkIE1NTU0sIHknLCAnRUVFRSwgZGQgTU1NTSwgeSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLCBbJ3sxfSwgezB9JywgdSwgdSwgdV0sXG4gIFtcbiAgICAnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICctJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsXG4gICAgJ+GDkOGDoMKg4YOQ4YOg4YOY4YOhwqDhg6Dhg5jhg6rhg67hg5Xhg5gnLCAnOidcbiAgXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqDCpCcsICcjRTAnXSwgJ+KCvicsICfhg6Xhg5Dhg6Dhg5fhg6Phg5rhg5gg4YOa4YOQ4YOg4YOYJywge1xuICAgICdBVUQnOiBbdSwgJyQnXSxcbiAgICAnQ05ZJzogW3UsICfCpSddLFxuICAgICdHRUwnOiBbJ+KCviddLFxuICAgICdIS0QnOiBbdSwgJyQnXSxcbiAgICAnSUxTJzogW3UsICfigqonXSxcbiAgICAnSU5SJzogW3UsICfigrknXSxcbiAgICAnSlBZJzogW3UsICfCpSddLFxuICAgICdLUlcnOiBbdSwgJ+KCqSddLFxuICAgICdOWkQnOiBbdSwgJyQnXSxcbiAgICAnVFdEJzogWydOVCQnXSxcbiAgICAnVVNEJzogWydVUyQnLCAnJCddLFxuICAgICdWTkQnOiBbdSwgJ+KCqyddXG4gIH0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==