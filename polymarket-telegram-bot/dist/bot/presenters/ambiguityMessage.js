export function buildAmbiguityMessage(candidates) {
    const lines = ['I found multiple similar markets. Choose one:'];
    candidates.forEach((candidate, index) => {
        lines.push(`${index + 1}. ${candidate.title}${candidate.endDate ? ` (${candidate.endDate})` : ''}`);
    });
    return lines.join('\n');
}
