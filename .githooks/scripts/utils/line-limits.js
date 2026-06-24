'use strict';

module.exports = (lines, options, errors) => {
    var limits = options.lineLimits;
    lines.forEach((line, index) => {
        line = line.trim();
        if (index === 0) {
            if (line.length === 0) {
                errors.push('First line of commit message must not be empty!');
            } else if (line.length > limits.firstLine) {
                errors.push(`First line of commit message must be no logner than ${limits.firstLine} characters!`);
            }
        } else if (index === 1 && line.length > 0) {
            errors.push('Second line must be always empty!');
        } else if (line.length > limits.otherLine) {
            errors.push(
                `Commit message line ${index + 1} is too long: ${line.length}, only ${limits.otherLine} are allowed.
                The line is: ${line.substring(0, 20)} [...]!`
            );
        }
    });
}