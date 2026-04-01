export function normalizeWhitespace(input) {
    return input.replace(/\s+/g, ' ').trim();
}
export function normalizeText(input) {
    return normalizeWhitespace(input.toLowerCase());
}
export function tokenize(input) {
    return normalizeText(input).split(/[^a-z0-9$.%]+/).filter(Boolean);
}
export function removeMatched(input, patterns) {
    let output = input;
    for (const pattern of patterns) {
        output = output.replace(pattern, ' ');
    }
    return normalizeWhitespace(output);
}
