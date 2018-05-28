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
        define("@angular/common/locales/hy", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || i === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'hy', [['ա', 'հ'], ['ԿԱ', 'ԿՀ'], u], [['ԿԱ', 'ԿՀ'], u, u],
        [
            ['Կ', 'Ե', 'Ե', 'Չ', 'Հ', 'Ո', 'Շ'],
            ['կիր', 'երկ', 'երք', 'չրք', 'հնգ', 'ուր', 'շբթ'],
            [
                'կիրակի', 'երկուշաբթի', 'երեքշաբթի', 'չորեքշաբթի',
                'հինգշաբթի', 'ուրբաթ', 'շաբաթ'
            ],
            ['կր', 'եկ', 'եք', 'չք', 'հգ', 'ու', 'շբ']
        ],
        u,
        [
            ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
            [
                'հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ',
                'հոկ', 'նոյ', 'դեկ'
            ],
            [
                'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի',
                'հունիսի', 'հուլիսի', 'օգոստոսի', 'սեպտեմբերի',
                'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի'
            ]
        ],
        [
            ['Հ', 'Փ', 'Մ', 'Ա', 'Մ', 'Հ', 'Հ', 'Օ', 'Ս', 'Հ', 'Ն', 'Դ'],
            [
                'հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ',
                'հոկ', 'նոյ', 'դեկ'
            ],
            [
                'հունվար', 'փետրվար', 'մարտ', 'ապրիլ', 'մայիս', 'հունիս',
                'հուլիս', 'օգոստոս', 'սեպտեմբեր', 'հոկտեմբեր',
                'նոյեմբեր', 'դեկտեմբեր'
            ]
        ],
        [['մ.թ.ա.', 'մ.թ.'], u, ['Քրիստոսից առաջ', 'Քրիստոսից հետո']], 1,
        [6, 0], ['dd.MM.yy', 'dd MMM, y թ.', 'dd MMMM, y թ.', 'y թ. MMMM d, EEEE'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1}, {0}', u, u, u],
        [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'ՈչԹ', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '֏', 'հայկական դրամ',
        { 'AMD': ['֏'], 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9oeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ25DLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1lBQ2pEO2dCQUNFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVk7Z0JBQ2pELFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTzthQUMvQjtZQUNELENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1NBQzNDO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7Z0JBQzdELEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSzthQUNwQjtZQUNEO2dCQUNFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRO2dCQUNuRCxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZO2dCQUM5QyxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVk7YUFDeEM7U0FDRjtRQUNEO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1RDtnQkFDRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7Z0JBQzdELEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSzthQUNwQjtZQUNEO2dCQUNFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUTtnQkFDeEQsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVztnQkFDN0MsVUFBVSxFQUFFLFdBQVc7YUFDeEI7U0FDRjtRQUNELENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDaEUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztRQUMxRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsZUFBZTtRQUNsRSxFQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQyxFQUFFLE1BQU07S0FDMUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAoaSA9PT0gMCB8fCBpID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2h5JywgW1sn1aEnLCAn1bAnXSwgWyfUv9SxJywgJ9S/1YAnXSwgdV0sIFtbJ9S/1LEnLCAn1L/VgCddLCB1LCB1XSxcbiAgW1xuICAgIFsn1L8nLCAn1LUnLCAn1LUnLCAn1YknLCAn1YAnLCAn1YgnLCAn1YcnXSxcbiAgICBbJ9Wv1avWgCcsICfVpdaA1a8nLCAn1aXWgNaEJywgJ9W51oDWhCcsICfVsNW21aMnLCAn1bjWgtaAJywgJ9W31aLVqSddLFxuICAgIFtcbiAgICAgICfVr9Wr1oDVodWv1asnLCAn1aXWgNWv1bjWgtW31aHVotWp1asnLCAn1aXWgNWl1oTVt9Wh1aLVqdWrJywgJ9W51bjWgNWl1oTVt9Wh1aLVqdWrJyxcbiAgICAgICfVsNWr1bbVo9W31aHVotWp1asnLCAn1bjWgtaA1aLVodWpJywgJ9W31aHVotWh1aknXG4gICAgXSxcbiAgICBbJ9Wv1oAnLCAn1aXVrycsICfVpdaEJywgJ9W51oQnLCAn1bDVoycsICfVuNaCJywgJ9W31aInXVxuICBdLFxuICB1LFxuICBbXG4gICAgWyfVgCcsICfVkycsICfVhCcsICfUsScsICfVhCcsICfVgCcsICfVgCcsICfVlScsICfVjScsICfVgCcsICfVhicsICfUtCddLFxuICAgIFtcbiAgICAgICfVsNW21b4nLCAn1oPVv9W+JywgJ9W01oDVvycsICfVodW61oAnLCAn1bTVtdW9JywgJ9Ww1bbVvScsICfVsNWs1b0nLCAn1oXVo9W9JywgJ9W91aXVuicsXG4gICAgICAn1bDVuNWvJywgJ9W21bjVtScsICfVpNWl1a8nXG4gICAgXSxcbiAgICBbXG4gICAgICAn1bDVuNaC1bbVvtWh1oDVqycsICfWg9Wl1b/WgNW+1aHWgNWrJywgJ9W01aHWgNW/1asnLCAn1aHVutaA1avVrNWrJywgJ9W01aHVtdWr1b3VqycsXG4gICAgICAn1bDVuNaC1bbVq9W91asnLCAn1bDVuNaC1azVq9W91asnLCAn1oXVo9W41b3Vv9W41b3VqycsICfVvdWl1brVv9Wl1bTVotWl1oDVqycsXG4gICAgICAn1bDVuNWv1b/VpdW01aLVpdaA1asnLCAn1bbVuNW11aXVtNWi1aXWgNWrJywgJ9Wk1aXVr9W/1aXVtNWi1aXWgNWrJ1xuICAgIF1cbiAgXSxcbiAgW1xuICAgIFsn1YAnLCAn1ZMnLCAn1YQnLCAn1LEnLCAn1YQnLCAn1YAnLCAn1YAnLCAn1ZUnLCAn1Y0nLCAn1YAnLCAn1YYnLCAn1LQnXSxcbiAgICBbXG4gICAgICAn1bDVttW+JywgJ9aD1b/VvicsICfVtNaA1b8nLCAn1aHVutaAJywgJ9W01bXVvScsICfVsNW21b0nLCAn1bDVrNW9JywgJ9aF1aPVvScsICfVvdWl1bonLFxuICAgICAgJ9Ww1bjVrycsICfVttW41bUnLCAn1aTVpdWvJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ9Ww1bjWgtW21b7VodaAJywgJ9aD1aXVv9aA1b7VodaAJywgJ9W01aHWgNW/JywgJ9Wh1brWgNWr1awnLCAn1bTVodW11avVvScsICfVsNW41oLVttWr1b0nLFxuICAgICAgJ9Ww1bjWgtWs1avVvScsICfWhdWj1bjVvdW/1bjVvScsICfVvdWl1brVv9Wl1bTVotWl1oAnLCAn1bDVuNWv1b/VpdW01aLVpdaAJyxcbiAgICAgICfVttW41bXVpdW01aLVpdaAJywgJ9Wk1aXVr9W/1aXVtNWi1aXWgCdcbiAgICBdXG4gIF0sXG4gIFtbJ9W0LtWpLtWhLicsICfVtC7VqS4nXSwgdSwgWyfVlNaA1avVvdW/1bjVvdWr1oEg1aHVvNWh1bsnLCAn1ZTWgNWr1b3Vv9W41b3Vq9aBINWw1aXVv9W4J11dLCAxLFxuICBbNiwgMF0sIFsnZGQuTU0ueXknLCAnZGQgTU1NLCB5INWpLicsICdkZCBNTU1NLCB5INWpLicsICd5INWpLiBNTU1NIGQsIEVFRUUnXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSwgWyd7MX0sIHswfScsIHUsIHUsIHVdLFxuICBbJywnLCAnwqAnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAn1YjVudS5JywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqDCpCcsICcjRTAnXSwgJ9aPJywgJ9Ww1aHVtdWv1aHVr9Wh1bYg1aTWgNWh1bQnLFxuICB7J0FNRCc6IFsn1o8nXSwgJ0pQWSc6IFsnSlDCpScsICfCpSddLCAnVEhCJzogWyfguL8nXSwgJ1RXRCc6IFsnTlQkJ119LCBwbHVyYWxcbl07XG4iXX0=