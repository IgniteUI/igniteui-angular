export function classListContains(element: HTMLElement, className: string, expected: boolean) {
    expect(element.classList.contains(className)).toBe(expected);
}
