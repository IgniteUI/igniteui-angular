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
        define("@angular/common/locales/kn", ["require", "exports"], factory);
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
        'kn', [['ಪೂ', 'ಅ'], ['ಪೂರ್ವಾಹ್ನ', 'ಅಪರಾಹ್ನ'], u],
        [['ಪೂರ್ವಾಹ್ನ', 'ಅಪರಾಹ್ನ'], u, u],
        [
            ['ಭಾ', 'ಸೋ', 'ಮಂ', 'ಬು', 'ಗು', 'ಶು', 'ಶ'],
            [
                'ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ',
                'ಶನಿ'
            ],
            [
                'ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ',
                'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'
            ],
            [
                'ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ',
                'ಶನಿ'
            ]
        ],
        u,
        [
            [
                'ಜ', 'ಫೆ', 'ಮಾ', 'ಏ', 'ಮೇ', 'ಜೂ', 'ಜು', 'ಆ', 'ಸೆ', 'ಅ', 'ನ',
                'ಡಿ'
            ],
            [
                'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ',
                'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ',
                'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'
            ],
            [
                'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್',
                'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್',
                'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
                'ಡಿಸೆಂಬರ್'
            ]
        ],
        [
            [
                'ಜ', 'ಫೆ', 'ಮಾ', 'ಏ', 'ಮೇ', 'ಜೂ', 'ಜು', 'ಆ', 'ಸೆ', 'ಅ', 'ನ',
                'ಡಿ'
            ],
            [
                'ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ', 'ಮೇ',
                'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ',
                'ನವೆಂ', 'ಡಿಸೆಂ'
            ],
            [
                'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್',
                'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್',
                'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
                'ಡಿಸೆಂಬರ್'
            ]
        ],
        [
            ['ಕ್ರಿ.ಪೂ', 'ಕ್ರಿ.ಶ'], u,
            ['ಕ್ರಿಸ್ತ ಪೂರ್ವ', 'ಕ್ರಿಸ್ತ ಶಕ']
        ],
        0, [0, 0], ['d/M/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
        ['hh:mm a', 'hh:mm:ss a', 'hh:mm:ss a z', 'hh:mm:ss a zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '₹', 'ಭಾರತೀಯ ರೂಪಾಯಿ',
        { 'JPY': ['JP¥', '¥'], 'RON': [u, 'ಲೀ'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9rbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEM7WUFDRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztZQUN6QztnQkFDRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU87Z0JBQzdDLEtBQUs7YUFDTjtZQUNEO2dCQUNFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVE7Z0JBQ3hDLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUTthQUNoQztZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTztnQkFDN0MsS0FBSzthQUNOO1NBQ0Y7UUFDRCxDQUFDO1FBQ0Q7WUFDRTtnQkFDRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDM0QsSUFBSTthQUNMO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTztnQkFDdEMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVM7Z0JBQ3JDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTzthQUN6QjtZQUNEO2dCQUNFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVM7Z0JBQ3hDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVE7Z0JBQzlCLFlBQVksRUFBRSxVQUFVLEVBQUUsU0FBUztnQkFDbkMsVUFBVTthQUNYO1NBQ0Y7UUFDRDtZQUNFO2dCQUNFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUMzRCxJQUFJO2FBQ0w7WUFDRDtnQkFDRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSTtnQkFDdEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU87Z0JBQ3hDLE1BQU0sRUFBRSxPQUFPO2FBQ2hCO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUztnQkFDeEMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUTtnQkFDOUIsWUFBWSxFQUFFLFVBQVUsRUFBRSxTQUFTO2dCQUNuQyxVQUFVO2FBQ1g7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN4QixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUM7U0FDaEM7UUFDRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQztRQUNqRSxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEYsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxlQUFlO1FBQ2pFLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQyxFQUFFLE1BQU07S0FDOUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAoaSA9PT0gMCB8fCBuID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2tuJywgW1sn4LKq4LOCJywgJ+CyhSddLCBbJ+CyquCzguCysOCzjeCyteCyvuCyueCzjeCyqCcsICfgsoXgsqrgsrDgsr7gsrngs43gsqgnXSwgdV0sXG4gIFtbJ+CyquCzguCysOCzjeCyteCyvuCyueCzjeCyqCcsICfgsoXgsqrgsrDgsr7gsrngs43gsqgnXSwgdSwgdV0sXG4gIFtcbiAgICBbJ+CyreCyvicsICfgsrjgs4snLCAn4LKu4LKCJywgJ+CyrOCzgScsICfgspfgs4EnLCAn4LK24LOBJywgJ+CytiddLFxuICAgIFtcbiAgICAgICfgsq3gsr7gsqjgs4EnLCAn4LK44LOL4LKuJywgJ+CyruCyguCyl+CysycsICfgsqzgs4HgsqcnLCAn4LKX4LOB4LKw4LOBJywgJ+CytuCzgeCyleCzjeCysCcsXG4gICAgICAn4LK24LKo4LK/J1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CyreCyvuCyqOCzgeCyteCyvuCysCcsICfgsrjgs4vgsq7gsrXgsr7gsrAnLCAn4LKu4LKC4LKX4LKz4LK14LK+4LKwJywgJ+CyrOCzgeCyp+CyteCyvuCysCcsXG4gICAgICAn4LKX4LOB4LKw4LOB4LK14LK+4LKwJywgJ+CytuCzgeCyleCzjeCysOCyteCyvuCysCcsICfgsrbgsqjgsr/gsrXgsr7gsrAnXG4gICAgXSxcbiAgICBbXG4gICAgICAn4LKt4LK+4LKo4LOBJywgJ+CyuOCzi+CyricsICfgsq7gsoLgspfgsrMnLCAn4LKs4LOB4LKnJywgJ+Cyl+CzgeCysOCzgScsICfgsrbgs4HgspXgs43gsrAnLFxuICAgICAgJ+CytuCyqOCyvydcbiAgICBdXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbXG4gICAgICAn4LKcJywgJ+Cyq+CzhicsICfgsq7gsr4nLCAn4LKPJywgJ+CyruCzhycsICfgspzgs4InLCAn4LKc4LOBJywgJ+CyhicsICfgsrjgs4YnLCAn4LKFJywgJ+CyqCcsXG4gICAgICAn4LKh4LK/J1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CynOCyqOCyteCysOCyvycsICfgsqvgs4bgsqzgs43gsrDgsrXgsrDgsr8nLCAn4LKu4LK+4LKw4LON4LKa4LONJywgJ+Cyj+CyquCzjeCysOCyvycsXG4gICAgICAn4LKu4LOHJywgJ+CynOCzguCyqOCzjScsICfgspzgs4HgsrLgs4gnLCAn4LKG4LKXJywgJ+CyuOCzhuCyquCzjeCyn+CzhuCygicsXG4gICAgICAn4LKF4LKV4LON4LKf4LOLJywgJ+CyqOCyteCzhuCygicsICfgsqHgsr/gsrjgs4bgsoInXG4gICAgXSxcbiAgICBbXG4gICAgICAn4LKc4LKo4LK14LKw4LK/JywgJ+Cyq+CzhuCyrOCzjeCysOCyteCysOCyvycsICfgsq7gsr7gsrDgs43gsprgs40nLCAn4LKP4LKq4LON4LKw4LK/4LKy4LONJyxcbiAgICAgICfgsq7gs4cnLCAn4LKc4LOC4LKo4LONJywgJ+CynOCzgeCysuCziCcsICfgsobgspfgsrjgs43gsp/gs40nLFxuICAgICAgJ+CyuOCzhuCyquCzjeCyn+CzhuCyguCyrOCysOCzjScsICfgsoXgspXgs43gsp/gs4vgsqzgsrDgs40nLCAn4LKo4LK14LOG4LKC4LKs4LKw4LONJyxcbiAgICAgICfgsqHgsr/gsrjgs4bgsoLgsqzgsrDgs40nXG4gICAgXVxuICBdLFxuICBbXG4gICAgW1xuICAgICAgJ+CynCcsICfgsqvgs4YnLCAn4LKu4LK+JywgJ+CyjycsICfgsq7gs4cnLCAn4LKc4LOCJywgJ+CynOCzgScsICfgsoYnLCAn4LK44LOGJywgJ+CyhScsICfgsqgnLFxuICAgICAgJ+CyoeCyvydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgspzgsqgnLCAn4LKr4LOG4LKs4LON4LKwJywgJ+CyruCyvuCysOCzjeCymuCzjScsICfgso/gsqrgs43gsrDgsr8nLCAn4LKu4LOHJyxcbiAgICAgICfgspzgs4Lgsqjgs40nLCAn4LKc4LOB4LKy4LOIJywgJ+CyhuCylycsICfgsrjgs4bgsqrgs43gsp/gs4bgsoInLCAn4LKF4LKV4LON4LKf4LOLJyxcbiAgICAgICfgsqjgsrXgs4bgsoInLCAn4LKh4LK/4LK44LOG4LKCJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ+CynOCyqOCyteCysOCyvycsICfgsqvgs4bgsqzgs43gsrDgsrXgsrDgsr8nLCAn4LKu4LK+4LKw4LON4LKa4LONJywgJ+Cyj+CyquCzjeCysOCyv+CysuCzjScsXG4gICAgICAn4LKu4LOHJywgJ+CynOCzguCyqOCzjScsICfgspzgs4HgsrLgs4gnLCAn4LKG4LKX4LK44LON4LKf4LONJyxcbiAgICAgICfgsrjgs4bgsqrgs43gsp/gs4bgsoLgsqzgsrDgs40nLCAn4LKF4LKV4LON4LKf4LOL4LKs4LKw4LONJywgJ+CyqOCyteCzhuCyguCyrOCysOCzjScsXG4gICAgICAn4LKh4LK/4LK44LOG4LKC4LKs4LKw4LONJ1xuICAgIF1cbiAgXSxcbiAgW1xuICAgIFsn4LKV4LON4LKw4LK/LuCyquCzgicsICfgspXgs43gsrDgsr8u4LK2J10sIHUsXG4gICAgWyfgspXgs43gsrDgsr/gsrjgs43gsqQg4LKq4LOC4LKw4LON4LK1JywgJ+CyleCzjeCysOCyv+CyuOCzjeCypCDgsrbgspUnXVxuICBdLFxuICAwLCBbMCwgMF0sIFsnZC9NL3l5JywgJ01NTSBkLCB5JywgJ01NTU0gZCwgeScsICdFRUVFLCBNTU1NIGQsIHknXSxcbiAgWydoaDptbSBhJywgJ2hoOm1tOnNzIGEnLCAnaGg6bW06c3MgYSB6JywgJ2hoOm1tOnNzIGEgenp6eiddLCBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ8KkIywjIzAuMDAnLCAnI0UwJ10sICfigrknLCAn4LKt4LK+4LKw4LKk4LOA4LKvIOCysOCzguCyquCyvuCyr+CyvycsXG4gIHsnSlBZJzogWydKUMKlJywgJ8KlJ10sICdST04nOiBbdSwgJ+CysuCzgCddLCAnVEhCJzogWyfguL8nXSwgJ1RXRCc6IFsnTlQkJ119LCBwbHVyYWxcbl07XG4iXX0=