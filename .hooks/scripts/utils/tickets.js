'use strict';

module.exports = function(lines, options, errors) {
    var ticket = new RegExp(options.ticketPattern);
    lines.forEach(function (line) {
        line = line.trim();

        if(!ticket.test(line) && line !== "") {
            errors.push(
                'Invalid ticket reference, template for the tickets should be (etc. #123 #456)\n The line is: ' + line
            );
        }
    });
}