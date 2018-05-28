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
        define("@angular/common/locales/gu", ["require", "exports"], factory);
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
        'gu', [['AM', 'PM'], u, u], u,
        [
            ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'],
            [
                'રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર',
                'શનિ'
            ],
            [
                'રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર',
                'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'
            ],
            ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ']
        ],
        u,
        [
            [
                'જા', 'ફે', 'મા', 'એ', 'મે', 'જૂ', 'જુ', 'ઑ', 'સ', 'ઑ', 'ન',
                'ડિ'
            ],
            [
                'જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે',
                'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો',
                'નવે', 'ડિસે'
            ],
            [
                'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ',
                'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ',
                'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર',
                'ડિસેમ્બર'
            ]
        ],
        u,
        [
            ['ઇ સ પુ', 'ઇસ'], ['ઈ.સ.પૂર્વે', 'ઈ.સ.'],
            ['ઈસવીસન પૂર્વે', 'ઇસવીસન']
        ],
        0, [0, 0], ['d/M/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, d MMMM, y'],
        ['hh:mm a', 'hh:mm:ss a', 'hh:mm:ss a z', 'hh:mm:ss a zzzz'],
        ['{1} {0}', u, '{1} એ {0} વાગ્યે', u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##,##0%', '¤#,##,##0.00', '[#E0]'], '₹',
        'ભારતીય રૂપિયા', {
            'JPY': ['JP¥', '¥'],
            'MUR': [u, 'રૂ.'],
            'THB': ['฿'],
            'TWD': ['NT$'],
            'USD': ['US$', '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9ndS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdCO1lBQ0UsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7WUFDeEM7Z0JBQ0UsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPO2dCQUM1QyxLQUFLO2FBQ047WUFDRDtnQkFDRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRO2dCQUN2QyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVE7YUFDaEM7WUFDRCxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztTQUN6QztRQUNELENBQUM7UUFDRDtZQUNFO2dCQUNFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUMzRCxJQUFJO2FBQ0w7WUFDRDtnQkFDRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSTtnQkFDM0MsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU87Z0JBQ3pDLEtBQUssRUFBRSxNQUFNO2FBQ2Q7WUFDRDtnQkFDRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU87Z0JBQ2pDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPO2dCQUN2QyxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVM7Z0JBQ2pDLFVBQVU7YUFDWDtTQUNGO1FBQ0QsQ0FBQztRQUNEO1lBQ0UsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDO1lBQ3hDLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztTQUM1QjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDO1FBQ2pFLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsaUJBQWlCLENBQUM7UUFDNUQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsY0FBYyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRztRQUMzRCxlQUFlLEVBQUU7WUFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7WUFDakIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztTQUNwQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnZ3UnLCBbWydBTScsICdQTSddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsn4KqwJywgJ+CquOCriycsICfgqq7gqoInLCAn4Kqs4KuBJywgJ+Cql+CrgScsICfgqrbgq4EnLCAn4Kq2J10sXG4gICAgW1xuICAgICAgJ+CqsOCqteCqvycsICfgqrjgq4vgqq4nLCAn4Kqu4KqC4KqX4KqzJywgJ+CqrOCrgeCqpycsICfgqpfgq4HgqrDgq4EnLCAn4Kq24KuB4KqV4KuN4KqwJyxcbiAgICAgICfgqrbgqqjgqr8nXG4gICAgXSxcbiAgICBbXG4gICAgICAn4Kqw4Kq14Kq/4Kq14Kq+4KqwJywgJ+CquOCri+CqruCqteCqvuCqsCcsICfgqq7gqoLgqpfgqrPgqrXgqr7gqrAnLCAn4Kqs4KuB4Kqn4Kq14Kq+4KqwJyxcbiAgICAgICfgqpfgq4HgqrDgq4HgqrXgqr7gqrAnLCAn4Kq24KuB4KqV4KuN4Kqw4Kq14Kq+4KqwJywgJ+CqtuCqqOCqv+CqteCqvuCqsCdcbiAgICBdLFxuICAgIFsn4KqwJywgJ+CquOCriycsICfgqq7gqoInLCAn4Kqs4KuBJywgJ+Cql+CrgScsICfgqrbgq4EnLCAn4Kq2J11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFtcbiAgICAgICfgqpzgqr4nLCAn4Kqr4KuHJywgJ+CqruCqvicsICfgqo8nLCAn4Kqu4KuHJywgJ+CqnOCrgicsICfgqpzgq4EnLCAn4KqRJywgJ+CquCcsICfgqpEnLCAn4KqoJyxcbiAgICAgICfgqqHgqr8nXG4gICAgXSxcbiAgICBbXG4gICAgICAn4Kqc4Kq+4Kqo4KuN4Kqv4KuBJywgJ+Cqq+Crh+CqrOCrjeCqsOCrgScsICfgqq7gqr7gqrDgq43gqponLCAn4KqP4Kqq4KuN4Kqw4Kq/4KqyJywgJ+CqruCrhycsXG4gICAgICAn4Kqc4KuC4KqoJywgJ+CqnOCrgeCqsuCqvuCqiCcsICfgqpHgqpfgqrjgq43gqp8nLCAn4Kq44Kqq4KuN4Kqf4KuHJywgJ+CqkeCqleCrjeCqn+CriycsXG4gICAgICAn4Kqo4Kq14KuHJywgJ+CqoeCqv+CquOCrhydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgqpzgqr7gqqjgq43gqq/gq4HgqobgqrDgq4AnLCAn4Kqr4KuH4Kqs4KuN4Kqw4KuB4KqG4Kqw4KuAJywgJ+CqruCqvuCqsOCrjeCqmicsXG4gICAgICAn4KqP4Kqq4KuN4Kqw4Kq/4KqyJywgJ+CqruCrhycsICfgqpzgq4LgqqgnLCAn4Kqc4KuB4Kqy4Kq+4KqIJywgJ+CqkeCql+CquOCrjeCqnycsXG4gICAgICAn4Kq44Kqq4KuN4Kqf4KuH4Kqu4KuN4Kqs4KqwJywgJ+CqkeCqleCrjeCqn+Cri+CqrOCqsCcsICfgqqjgqrXgq4fgqq7gq43gqqzgqrAnLFxuICAgICAgJ+CqoeCqv+CquOCrh+CqruCrjeCqrOCqsCdcbiAgICBdXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ+CqhyDgqrgg4Kqq4KuBJywgJ+Cqh+CquCddLCBbJ+CqiC7gqrgu4Kqq4KuC4Kqw4KuN4Kq14KuHJywgJ+CqiC7gqrguJ10sXG4gICAgWyfgqojgqrjgqrXgq4Dgqrjgqqgg4Kqq4KuC4Kqw4KuN4Kq14KuHJywgJ+Cqh+CquOCqteCrgOCquOCqqCddXG4gIF0sXG4gIDAsIFswLCAwXSwgWydkL00veXknLCAnZCBNTU0sIHknLCAnZCBNTU1NLCB5JywgJ0VFRUUsIGQgTU1NTSwgeSddLFxuICBbJ2hoOm1tIGEnLCAnaGg6bW06c3MgYScsICdoaDptbTpzcyBhIHonLCAnaGg6bW06c3MgYSB6enp6J10sXG4gIFsnezF9IHswfScsIHUsICd7MX0g4KqPIHswfSDgqrXgqr7gqpfgq43gqq/gq4cnLCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjLCMjMC4jIyMnLCAnIywjIywjIzAlJywgJ8KkIywjIywjIzAuMDAnLCAnWyNFMF0nXSwgJ+KCuScsXG4gICfgqq3gqr7gqrDgqqTgq4Dgqq8g4Kqw4KuC4Kqq4Kq/4Kqv4Kq+Jywge1xuICAgICdKUFknOiBbJ0pQwqUnLCAnwqUnXSxcbiAgICAnTVVSJzogW3UsICfgqrDgq4IuJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1RXRCc6IFsnTlQkJ10sXG4gICAgJ1VTRCc6IFsnVVMkJywgJyQnXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=