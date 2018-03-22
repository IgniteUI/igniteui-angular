'use strict';

var path = require('path');

var defaults = {
    default: {
        style: 'default',
        limits: {
            firstLine: 80,
            otherLine: 80
        },
        ticketPattern: '(#)[0-9]+',
        guidelinesUrl: 'https://bit.ly/angular-guidelines',
        types: [
            'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'
        ],
        scipe: '\\S+.*'
    },
    oldMessagePath: path.join('.git', 'COMMIT_EDITMSG_OLD'),
    oldMessageSeconds: 300
}

module.exports = defaults;