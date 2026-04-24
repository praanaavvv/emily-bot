import type { MarketCandidate } from '../../types/market.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function scoreLabel(score: number): string {
  if (score >= 0.85) return 'strong';
  if (score >= 0.65) return 'medium';
  return 'weak';
}

function clampText(value: string, max = 110): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function buildAmbiguityMessage(candidates: MarketCandidate[]): string {
  const topCandidates = candidates.slice(0, 3);
  const lines: string[] = [
    '<b>⚖️ Multiple matches found</b>',
    '',
    '<b>Title</b>',
    'I found multiple similar markets.',
    '',
    '<b>Key details</b>',
  ];

  topCandidates.forEach((candidate, index) => {
    const details = [
      `• Match: <b>${scoreLabel(candidate.matchScore)}</b> (${(candidate.matchScore * 100).toFixed(0)}%)`,
      `• Tradable: <b>${candidate.acceptingOrders ? 'yes' : 'no'}</b>`,
    ];
    if (candidate.endDate) {
      details.push(`• Ends: <b>${escapeHtml(clampText(candidate.endDate, 40))}</b>`);
    }

    lines.push(
      `${index + 1}. <b>${escapeHtml(clampText(candidate.title))}</b>`,
      details.join(' '),
    );
  });

  lines.push('', '<b>Next action</b>', 'Choose the exact market below. I will not guess silently.');
  return lines.join('\n');
}
