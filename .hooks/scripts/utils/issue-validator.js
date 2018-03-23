'use strict';

var matchType = require('../common').matchType;

module.exports = function(lines, options, errors) {
    var ticket = new RegExp(options.issuePattern);
    lines.forEach(function (line) {
        line = line.trim();

        if(line !== "" && 
            matchType(options.typesWithMandatoryIssue, line) && 
            !ticket.test(line)) {
            errors.push(
                'Invalid ticket reference, template for the tickets should be (etc. #123 #456)\n The line is: ' + line
            );
        }
    });
}