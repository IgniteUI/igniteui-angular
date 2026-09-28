import { DayDigitPipe } from './day-digit.pipe';

describe('DayDigitPipe', () => {
    const pipe = new DayDigitPipe();

    it('should return an empty string for empty values', () => {
        expect(pipe.transform('', { day: true })).toBe('');
        expect(pipe.transform(null, { day: true })).toBe('');
        expect(pipe.transform(undefined, { day: false })).toBe('');
    });

    it('should return the value unchanged when the day view is not formatted', () => {
        expect(pipe.transform('25日', { day: false })).toBe('25日');
        expect(pipe.transform('7', {})).toBe('7');
    });

    it('should extract the day digits added by the locale formatter', () => {
        expect(pipe.transform('25日', { day: true })).toBe('25');
        expect(pipe.transform('05.', { day: true })).toBe('05');
        expect(pipe.transform('13', { day: true })).toBe('13');
    });

    it('should return the value unchanged when it contains no digits', () => {
        expect(pipe.transform('twenty', { day: true })).toBe('twenty');
    });
});
