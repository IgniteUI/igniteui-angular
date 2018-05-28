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
        define("@angular/common/locales/fa-AF", ["require", "exports"], factory);
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
        'fa-AF', [['ق', 'ب'], ['ق.ظ.', 'ب.ظ.'], ['قبل\u200cازظهر', 'بعدازظهر']],
        [['ق.ظ.', 'ب.ظ.'], u, ['قبل\u200cازظهر', 'بعدازظهر']],
        [
            ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
            [
                'یکشنبه', 'دوشنبه', 'سه\u200cشنبه', 'چهارشنبه', 'پنجشنبه',
                'جمعه', 'شنبه'
            ],
            u, ['۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج', 'ش']
        ],
        u,
        [
            ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'جنو', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جول', 'اگست',
                'سپتمبر', 'اکتوبر', 'نومبر', 'دسم'
            ],
            [
                'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای',
                'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'
            ]
        ],
        [
            ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
            [
                'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای',
                'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'
            ],
            u
        ],
        [['ق', 'م'], ['ق.م.', 'م.'], ['قبل از میلاد', 'میلادی']], 6, [4, 5],
        ['y/M/d', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['H:mm', 'H:mm:ss', 'H:mm:ss (z)', 'H:mm:ss (zzzz)'],
        ['{1}،\u200f {0}', u, '{1}، ساعت {0}', u],
        ['.', ',', ';', '%', '\u200e+', '\u200e−', 'E', '×', '‰', '∞', 'ناعدد', ':'],
        ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], '؋', 'افغانی افغانستان', {
            'AFN': ['؋'],
            'CAD': ['$CA', '$'],
            'CNY': ['¥CN', '¥'],
            'HKD': ['$HK', '$'],
            'IRR': ['ریال'],
            'MXN': ['$MX', '$'],
            'NZD': ['$NZ', '$'],
            'THB': ['฿'],
            'XCD': ['$EC', '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmEtQUYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mYS1BRi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ25DO2dCQUNFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxTQUFTO2dCQUN6RCxNQUFNLEVBQUUsTUFBTTthQUNmO1lBQ0QsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1NBQzVDO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTTtnQkFDNUQsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSzthQUNuQztZQUNEO2dCQUNFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU87Z0JBQ3hELE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPO2FBQzdDO1NBQ0Y7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTztnQkFDeEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU87YUFDN0M7WUFDRCxDQUFDO1NBQ0Y7UUFDRCxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuRSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQztRQUNqRCxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDO1FBQ3BELENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFDekMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQztRQUM1RSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUNyRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztTQUNwQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnZmEtQUYnLCBbWyfZgicsICfYqCddLCBbJ9mCLti4LicsICfYqC7YuC4nXSwgWyfZgtio2YRcXHUyMDBj2KfYsti42YfYsScsICfYqNi52K/Yp9iy2LjZh9ixJ11dLFxuICBbWyfZgi7YuC4nLCAn2Kgu2LguJ10sIHUsIFsn2YLYqNmEXFx1MjAwY9in2LLYuNmH2LEnLCAn2KjYudiv2KfYsti42YfYsSddXSxcbiAgW1xuICAgIFsn24wnLCAn2K8nLCAn2LMnLCAn2oYnLCAn2b4nLCAn2KwnLCAn2LQnXSxcbiAgICBbXG4gICAgICAn24zaqdi02YbYqNmHJywgJ9iv2YjYtNmG2KjZhycsICfYs9mHXFx1MjAwY9i02YbYqNmHJywgJ9qG2YfYp9ix2LTZhtio2YcnLCAn2b7Zhtis2LTZhtio2YcnLFxuICAgICAgJ9is2YXYudmHJywgJ9i02YbYqNmHJ1xuICAgIF0sXG4gICAgdSwgWyfbsdi0JywgJ9uy2LQnLCAn27PYtCcsICfbtNi0JywgJ9u12LQnLCAn2KwnLCAn2LQnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWyfYrCcsICfZgScsICfZhScsICfYpycsICfZhScsICfYrCcsICfYrCcsICfYpycsICfYsycsICfYpycsICfZhicsICfYryddLFxuICAgIFtcbiAgICAgICfYrNmG2YgnLCAn2YHYqNix2YjYsduMJywgJ9mF2KfYsdqGJywgJ9in2b7YsduM2YQnLCAn2YXbjCcsICfYrNmI2YYnLCAn2KzZiNmEJywgJ9in2q/Ys9iqJyxcbiAgICAgICfYs9m+2KrZhdio2LEnLCAn2Kfaqdiq2YjYqNixJywgJ9mG2YjZhdio2LEnLCAn2K/Ys9mFJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ9is2YbZiNix24wnLCAn2YHYqNix2YjYsduMJywgJ9mF2KfYsdqGJywgJ9in2b7YsduM2YQnLCAn2YXbjCcsICfYrNmI2YYnLCAn2KzZiNmE2KfbjCcsXG4gICAgICAn2Kfar9iz2KonLCAn2LPZvtiq2YXYqNixJywgJ9in2qnYqtmI2KjYsScsICfZhtmI2YXYqNixJywgJ9iv2LPZhdio2LEnXG4gICAgXVxuICBdLFxuICBbXG4gICAgWyfYrCcsICfZgScsICfZhScsICfYpycsICfZhScsICfYrCcsICfYrCcsICfYpycsICfYsycsICfYpycsICfZhicsICfYryddLFxuICAgIFtcbiAgICAgICfYrNmG2YjYsduMJywgJ9mB2KjYsdmI2LHbjCcsICfZhdin2LHahicsICfYp9m+2LHbjNmEJywgJ9mF24wnLCAn2KzZiNmGJywgJ9is2YjZhNin24wnLFxuICAgICAgJ9in2q/Ys9iqJywgJ9iz2b7YqtmF2KjYsScsICfYp9qp2KrZiNio2LEnLCAn2YbZiNmF2KjYsScsICfYr9iz2YXYqNixJ1xuICAgIF0sXG4gICAgdVxuICBdLFxuICBbWyfZgicsICfZhSddLCBbJ9mCLtmFLicsICfZhS4nXSwgWyfZgtio2YQg2KfYsiDZhduM2YTYp9ivJywgJ9mF24zZhNin2K/bjCddXSwgNiwgWzQsIDVdLFxuICBbJ3kvTS9kJywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0g6bW0nLCAnSDptbTpzcycsICdIOm1tOnNzICh6KScsICdIOm1tOnNzICh6enp6KSddLFxuICBbJ3sxfdiMXFx1MjAwZiB7MH0nLCB1LCAnezF92Iwg2LPYp9i52KogezB9JywgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICdcXHUyMDBlKycsICdcXHUyMDBl4oiSJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICfZhtin2LnYr9ivJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ8KkwqAjLCMjMC4wMCcsICcjRTAnXSwgJ9iLJywgJ9in2YHYutin2YbbjCDYp9mB2LrYp9mG2LPYqtin2YYnLCB7XG4gICAgJ0FGTic6IFsn2IsnXSxcbiAgICAnQ0FEJzogWyckQ0EnLCAnJCddLFxuICAgICdDTlknOiBbJ8KlQ04nLCAnwqUnXSxcbiAgICAnSEtEJzogWyckSEsnLCAnJCddLFxuICAgICdJUlInOiBbJ9ix24zYp9mEJ10sXG4gICAgJ01YTic6IFsnJE1YJywgJyQnXSxcbiAgICAnTlpEJzogWyckTlonLCAnJCddLFxuICAgICdUSEInOiBbJ+C4vyddLFxuICAgICdYQ0QnOiBbJyRFQycsICckJ11cbiAgfSxcbiAgcGx1cmFsXG5dO1xuIl19