module.exports = function(lines, options, errors) {
    var limits = options.lineLimits;
    lines.forEach(function(line, index) {
        if (index === 0) {
            if (line.length === 0) {
                errors.push('First line of commit message must not be empty!');
            } else if (line.length > limits.firstLine) {
                errors.push('First line of commit message must be no logner than ' + 
                limits.firstLine + ' characters!');
            }
        } else if (index === 1 && line.length > 0) {
            errors.push('Second line must always be empty!');
        } else if (line.length > limits.otherLine) {
            errors.push(
                'Commit message line ' + (index + 1) + ' is too long: ' +
                line.length + ', only ' + limits.otherLine + ' are allowed.\n' +
                'The line is: ' + line.substring(0, 20) + '[...]!'
            );
        }
    });
}