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
        define("@angular/common/locales/si", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n)), f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
        if (n === 0 || n === 1 || i === 0 && f === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'si', [['පෙ', 'ප'], ['පෙ.ව.', 'ප.ව.'], u], [['පෙ.ව.', 'ප.ව.'], u, u],
        [
            ['ඉ', 'ස', 'අ', 'බ', 'බ්\u200dර', 'සි', 'සෙ'],
            [
                'ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා',
                'බ්\u200dරහස්', 'සිකු', 'සෙන'
            ],
            [
                'ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා',
                'බ්\u200dරහස්පතින්දා', 'සිකුරාදා',
                'සෙනසුරාදා'
            ],
            [
                'ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්\u200dරහ', 'සිකු',
                'සෙන'
            ]
        ],
        u,
        [
            [
                'ජ', 'පෙ', 'මා', 'අ', 'මැ', 'ජූ', 'ජූ', 'අ', 'සැ', 'ඔ',
                'නෙ', 'දෙ'
            ],
            [
                'ජන', 'පෙබ', 'මාර්තු', 'අප්\u200dරේල්', 'මැයි',
                'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ',
                'දෙසැ'
            ],
            [
                'ජනවාරි', 'පෙබරවාරි', 'මාර්තු',
                'අප්\u200dරේල්', 'මැයි', 'ජූනි', 'ජූලි',
                'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්',
                'නොවැම්බර්', 'දෙසැම්බර්'
            ]
        ],
        [
            [
                'ජ', 'පෙ', 'මා', 'අ', 'මැ', 'ජූ', 'ජූ', 'අ', 'සැ', 'ඔ',
                'නෙ', 'දෙ'
            ],
            [
                'ජන', 'පෙබ', 'මාර්', 'අප්\u200dරේල්', 'මැයි',
                'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ',
                'දෙසැ'
            ],
            [
                'ජනවාරි', 'පෙබරවාරි', 'මාර්තු',
                'අප්\u200dරේල්', 'මැයි', 'ජූනි', 'ජූලි',
                'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්',
                'නොවැම්බර්', 'දෙසැම්බර්'
            ]
        ],
        [
            ['ක්\u200dරි.පූ.', 'ක්\u200dරි.ව.'], u,
            [
                'ක්\u200dරිස්තු පූර්ව',
                'ක්\u200dරිස්තු වර්ෂ'
            ]
        ],
        1, [6, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
        ['HH.mm', 'HH.mm.ss', 'HH.mm.ss z', 'HH.mm.ss zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', '.'],
        ['#,##0.###', '#,##0%', '¤#,##0.00', '#'], 'රු.',
        'ශ්\u200dරී ලංකා රුපියල', {
            'JPY': ['JP¥', '¥'],
            'LKR': ['රු.'],
            'THB': ['฿'],
            'TWD': ['NT$'],
            'USD': ['US$', '$'],
            'XOF': ['සිෆ්එ']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9zaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlGLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEU7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUM3QztnQkFDRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPO2dCQUNoQyxjQUFjLEVBQUUsTUFBTSxFQUFFLEtB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R29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgZiA9IHBhcnNlSW50KG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLCAxMCkgfHwgMDtcbiAgaWYgKG4gPT09IDAgfHwgbiA9PT0gMSB8fCBpID09PSAwICYmIGYgPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnc2knLCBbWyfgtrTgt5knLCAn4La0J10sIFsn4La04LeZLuC3gC4nLCAn4La0LuC3gC4nXSwgdV0sIFtbJ+C2tOC3mS7gt4AuJywgJ+C2tC7gt4AuJ10sIHUsIHVdLFxuICBbXG4gICAgWyfgtoknLCAn4LeDJywgJ+C2hScsICfgtrYnLCAn4La24LeKXFx1MjAwZOC2uycsICfgt4Pgt5InLCAn4LeD4LeZJ10sXG4gICAgW1xuICAgICAgJ+C2ieC2u+C3kuC2r+C3jycsICfgt4PgtrPgt5Tgtq/gt48nLCAn4LaF4Laf4LeEJywgJ+C2tuC2r+C3j+C2r+C3jycsXG4gICAgICAn4La24LeKXFx1MjAwZOC2u+C3hOC3g+C3iicsICfgt4Pgt5Lgtprgt5QnLCAn4LeD4LeZ4LaxJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C2ieC2u+C3kuC2r+C3jycsICfgt4PgtrPgt5Tgtq/gt48nLCAn4LaF4Laf4LeE4La74LeU4LeA4LeP4Lav4LePJywgJ+C2tuC2r+C3j+C2r+C3jycsXG4gICAgICAn4La24LeKXFx1MjAwZOC2u+C3hOC3g+C3iuC2tOC2reC3kuC2seC3iuC2r+C3jycsICfgt4Pgt5Lgtprgt5Tgtrvgt4/gtq/gt48nLFxuICAgICAgJ+C3g+C3meC2seC3g+C3lOC2u+C3j+C2r+C3jydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgtongtrvgt5InLCAn4LeD4Laz4LeUJywgJ+C2heC2nycsICfgtrbgtq/gt48nLCAn4La24LeKXFx1MjAwZOC2u+C3hCcsICfgt4Pgt5Lgtprgt5QnLFxuICAgICAgJ+C3g+C3meC2sSdcbiAgICBdXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbXG4gICAgICAn4LaiJywgJ+C2tOC3mScsICfgtrjgt48nLCAn4LaFJywgJ+C2uOC3kCcsICfgtqLgt5YnLCAn4Lai4LeWJywgJ+C2hScsICfgt4Pgt5AnLCAn4LaUJyxcbiAgICAgICfgtrHgt5knLCAn4Lav4LeZJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C2ouC2sScsICfgtrTgt5ngtrYnLCAn4La44LeP4La74LeK4Lat4LeUJywgJ+C2heC2tOC3ilxcdTIwMGTgtrvgt5rgtr3gt4onLCAn4La44LeQ4La64LeSJyxcbiAgICAgICfgtqLgt5bgtrHgt5InLCAn4Lai4LeW4La94LeSJywgJ+C2heC2nOC3nScsICfgt4Pgt5DgtrTgt4onLCAn4LaU4Laa4LeKJywgJ+C2seC3nOC3gOC3kCcsXG4gICAgICAn4Lav4LeZ4LeD4LeQJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C2ouC2seC3gOC3j+C2u+C3kicsICfgtrTgt5ngtrbgtrvgt4Dgt4/gtrvgt5InLCAn4La44LeP4La74LeK4Lat4LeUJyxcbiAgICAgICfgtoXgtrTgt4pcXHUyMDBk4La74Lea4La94LeKJywgJ+C2uOC3kOC2uuC3kicsICfgtqLgt5bgtrHgt5InLCAn4Lai4LeW4La94LeSJyxcbiAgICAgICfgtoXgtpzgt53gt4Pgt4rgtq3gt5QnLCAn4LeD4LeQ4La04LeK4Lat4LeQ4La44LeK4La24La74LeKJywgJ+C2lOC2muC3iuC2reC3neC2tuC2u+C3iicsXG4gICAgICAn4Lax4Lec4LeA4LeQ4La44LeK4La24La74LeKJywgJ+C2r+C3meC3g+C3kOC2uOC3iuC2tuC2u+C3iidcbiAgICBdXG4gIF0sXG4gIFtcbiAgICBbXG4gICAgICAn4LaiJywgJ+C2tOC3mScsICfgtrjgt48nLCAn4LaFJywgJ+C2uOC3kCcsICfgtqLgt5YnLCAn4Lai4LeWJywgJ+C2hScsICfgt4Pgt5AnLCAn4LaUJyxcbiAgICAgICfgtrHgt5knLCAn4Lav4LeZJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C2ouC2sScsICfgtrTgt5ngtrYnLCAn4La44LeP4La74LeKJywgJ+C2heC2tOC3ilxcdTIwMGTgtrvgt5rgtr3gt4onLCAn4La44LeQ4La64LeSJyxcbiAgICAgICfgtqLgt5bgtrHgt5InLCAn4Lai4LeW4La94LeSJywgJ+C2heC2nOC3nScsICfgt4Pgt5DgtrTgt4onLCAn4LaU4Laa4LeKJywgJ+C2seC3nOC3gOC3kCcsXG4gICAgICAn4Lav4LeZ4LeD4LeQJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+C2ouC2seC3gOC3j+C2u+C3kicsICfgtrTgt5ngtrbgtrvgt4Dgt4/gtrvgt5InLCAn4La44LeP4La74LeK4Lat4LeUJyxcbiAgICAgICfgtoXgtrTgt4pcXHUyMDBk4La74Lea4La94LeKJywgJ+C2uOC3kOC2uuC3kicsICfgtqLgt5bgtrHgt5InLCAn4Lai4LeW4La94LeSJyxcbiAgICAgICfgtoXgtpzgt53gt4Pgt4rgtq3gt5QnLCAn4LeD4LeQ4La04LeK4Lat4LeQ4La44LeK4La24La74LeKJywgJ+C2lOC2muC3iuC2reC3neC2tuC2u+C3iicsXG4gICAgICAn4Lax4Lec4LeA4LeQ4La44LeK4La24La74LeKJywgJ+C2r+C3meC3g+C3kOC2uOC3iuC2tuC2u+C3iidcbiAgICBdXG4gIF0sXG4gIFtcbiAgICBbJ+C2muC3ilxcdTIwMGTgtrvgt5Iu4La04LeWLicsICfgtprgt4pcXHUyMDBk4La74LeSLuC3gC4nXSwgdSxcbiAgICBbXG4gICAgICAn4Laa4LeKXFx1MjAwZOC2u+C3kuC3g+C3iuC2reC3lCDgtrTgt5bgtrvgt4rgt4AnLFxuICAgICAgJ+C2muC3ilxcdTIwMGTgtrvgt5Lgt4Pgt4rgtq3gt5Qg4LeA4La74LeK4LeCJ1xuICAgIF1cbiAgXSxcbiAgMSwgWzYsIDBdLCBbJ3ktTU0tZGQnLCAneSBNTU0gZCcsICd5IE1NTU0gZCcsICd5IE1NTU0gZCwgRUVFRSddLFxuICBbJ0hILm1tJywgJ0hILm1tLnNzJywgJ0hILm1tLnNzIHonLCAnSEgubW0uc3Mgenp6eiddLCBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJy4nXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ8KkIywjIzAuMDAnLCAnIyddLCAn4La74LeULicsXG4gICfgt4Hgt4pcXHUyMDBk4La74LeTIOC2veC2guC2muC3jyDgtrvgt5TgtrTgt5Lgtrrgtr0nLCB7XG4gICAgJ0pQWSc6IFsnSlDCpScsICfCpSddLFxuICAgICdMS1InOiBbJ+C2u+C3lC4nXSxcbiAgICAnVEhCJzogWyfguL8nXSxcbiAgICAnVFdEJzogWydOVCQnXSxcbiAgICAnVVNEJzogWydVUyQnLCAnJCddLFxuICAgICdYT0YnOiBbJ+C3g+C3kuC3huC3iuC2kSddXG4gIH0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==