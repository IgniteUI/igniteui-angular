'use strict';

var matchType = require('../common').matchType,
    errorFactory = require('../common').errorFactory;

module.exports = function(lines, options, errors) {
    var ticket = new RegExp(options.issuePattern);
    lines.forEach(function (line) {
        line = line.trim();

        if(line !== "" && 
            matchType(options.typesWithMandatoryIssue, line) && 
            !ticket.test(line)) {
            errors.push(errorFactory(
                'The issue reference for (' + options.typesWithMandatoryIssue.join(', ') + ') types is mandatory!\n',
                'First line must be: <type>(<scope>): <subject> <#issue>\n', 'The line is: ' + line
            ));
        }
    });
}