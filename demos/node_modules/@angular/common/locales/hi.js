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
        define("@angular/common/locales/hi", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'hi', [['पू', 'अ'], ['पूर्वाह्न', 'अपराह्न'], u], u,
        [
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
            [
                'रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र',
                'शनि'
            ],
            [
                'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार',
                'गुरुवार', 'शुक्रवार', 'शनिवार'
            ],
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
        ],
        u,
        [
            [
                'ज', 'फ़', 'मा', 'अ', 'म', 'जू', 'जु', 'अ', 'सि', 'अ', 'न',
                'दि'
            ],
            [
                'जन॰', 'फ़र॰', 'मार्च', 'अप्रैल', 'मई', 'जून',
                'जुल॰', 'अग॰', 'सित॰', 'अक्तू॰', 'नव॰', 'दिस॰'
            ],
            [
                'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई',
                'जून', 'जुलाई', 'अगस्त', 'सितंबर',
                'अक्तूबर', 'नवंबर', 'दिसंबर'
            ]
        ],
        u,
        [
            ['ईसा-पूर्व', 'ईस्वी'], u,
            ['ईसा-पूर्व', 'ईसवी सन']
        ],
        0, [0, 0], ['d/M/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
        ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1}, {0}', u, '{1} को {0}', u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##,##0%', '¤#,##,##0.00', '[#E0]'], '₹',
        'भारतीय रुपया',
        { 'JPY': ['JP¥', '¥'], 'RON': [u, 'लेई'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9oaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkQ7WUFDRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztZQUN4QztnQkFDRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU87Z0JBQzVDLEtBQUs7YUFDTjtZQUNEO2dCQUNFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVE7Z0JBQ3ZDLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUTthQUNoQztZQUNELENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO1NBQ3pDO1FBQ0QsQ0FBQztRQUNEO1lBQ0U7Z0JBQ0UsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQzFELElBQUk7YUFDTDtZQUNEO2dCQUNFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFDN0MsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNO2FBQy9DO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUk7Z0JBQzFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUTthQUM3QjtTQUNGO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN6QixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUM7U0FDekI7UUFDRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQztRQUM5RCxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDMUYsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLGNBQWMsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUc7UUFDM0QsY0FBYztRQUNkLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQyxFQUFFLE1BQU07S0FDL0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAoaSA9PT0gMCB8fCBuID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2hpJywgW1sn4KSq4KWCJywgJ+CkhSddLCBbJ+CkquClguCksOCljeCkteCkvuCkueCljeCkqCcsICfgpIXgpKrgpLDgpL7gpLngpY3gpKgnXSwgdV0sIHUsXG4gIFtcbiAgICBbJ+CksCcsICfgpLjgpYsnLCAn4KSu4KSCJywgJ+CkrOClgScsICfgpJfgpYEnLCAn4KS24KWBJywgJ+CktiddLFxuICAgIFtcbiAgICAgICfgpLDgpLXgpL8nLCAn4KS44KWL4KSuJywgJ+CkruCkguCkl+CksicsICfgpKzgpYHgpKcnLCAn4KSX4KWB4KSw4KWBJywgJ+CktuClgeCkleCljeCksCcsXG4gICAgICAn4KS24KSo4KS/J1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CksOCkteCkv+CkteCkvuCksCcsICfgpLjgpYvgpK7gpLXgpL7gpLAnLCAn4KSu4KSC4KSX4KSy4KS14KS+4KSwJywgJ+CkrOClgeCkp+CkteCkvuCksCcsXG4gICAgICAn4KSX4KWB4KSw4KWB4KS14KS+4KSwJywgJ+CktuClgeCkleCljeCksOCkteCkvuCksCcsICfgpLbgpKjgpL/gpLXgpL7gpLAnXG4gICAgXSxcbiAgICBbJ+CksCcsICfgpLjgpYsnLCAn4KSu4KSCJywgJ+CkrOClgScsICfgpJfgpYEnLCAn4KS24KWBJywgJ+CktiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbXG4gICAgICAn4KScJywgJ+Ckq+CkvCcsICfgpK7gpL4nLCAn4KSFJywgJ+CkricsICfgpJzgpYInLCAn4KSc4KWBJywgJ+CkhScsICfgpLjgpL8nLCAn4KSFJywgJ+CkqCcsXG4gICAgICAn4KSm4KS/J1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CknOCkqOClsCcsICfgpKvgpLzgpLDgpbAnLCAn4KSu4KS+4KSw4KWN4KSaJywgJ+CkheCkquCljeCksOCliOCksicsICfgpK7gpIgnLCAn4KSc4KWC4KSoJyxcbiAgICAgICfgpJzgpYHgpLLgpbAnLCAn4KSF4KSX4KWwJywgJ+CkuOCkv+CkpOClsCcsICfgpIXgpJXgpY3gpKTgpYLgpbAnLCAn4KSo4KS14KWwJywgJ+CkpuCkv+CkuOClsCdcbiAgICBdLFxuICAgIFtcbiAgICAgICfgpJzgpKjgpLXgpLDgpYAnLCAn4KSr4KS84KSw4KS14KSw4KWAJywgJ+CkruCkvuCksOCljeCkmicsICfgpIXgpKrgpY3gpLDgpYjgpLInLCAn4KSu4KSIJyxcbiAgICAgICfgpJzgpYLgpKgnLCAn4KSc4KWB4KSy4KS+4KSIJywgJ+CkheCkl+CkuOCljeCkpCcsICfgpLjgpL/gpKTgpILgpKzgpLAnLFxuICAgICAgJ+CkheCkleCljeCkpOClguCkrOCksCcsICfgpKjgpLXgpILgpKzgpLAnLCAn4KSm4KS/4KS44KSC4KSs4KSwJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn4KSI4KS44KS+LeCkquClguCksOCljeCktScsICfgpIjgpLjgpY3gpLXgpYAnXSwgdSxcbiAgICBbJ+CkiOCkuOCkvi3gpKrgpYLgpLDgpY3gpLUnLCAn4KSI4KS44KS14KWAIOCkuOCkqCddXG4gIF0sXG4gIDAsIFswLCAwXSwgWydkL00veXknLCAnZCBNTU0geScsICdkIE1NTU0geScsICdFRUVFLCBkIE1NTU0geSddLFxuICBbJ2g6bW0gYScsICdoOm1tOnNzIGEnLCAnaDptbTpzcyBhIHonLCAnaDptbTpzcyBhIHp6enonXSwgWyd7MX0sIHswfScsIHUsICd7MX0g4KSV4KWLIHswfScsIHVdLFxuICBbJy4nLCAnLCcsICc7JywgJyUnLCAnKycsICctJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMsIyMwLiMjIycsICcjLCMjLCMjMCUnLCAnwqQjLCMjLCMjMC4wMCcsICdbI0UwXSddLCAn4oK5JyxcbiAgJ+CkreCkvuCksOCkpOClgOCkryDgpLDgpYHgpKrgpK/gpL4nLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnUk9OJzogW3UsICfgpLLgpYfgpIgnXSwgJ1RIQic6IFsn4Li/J10sICdUV0QnOiBbJ05UJCddfSwgcGx1cmFsXG5dO1xuIl19