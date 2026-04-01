import { formatUsdc } from '../../utils/money.js';
export function buildExecutionResultMessage(result) {
    if (result.kind === 'execution_success') {
        return [
            '✅ Trade submitted',
            `Order ID: ${result.orderId}`,
            `Status: ${result.status}`,
            `Amount: ${formatUsdc(result.requestedAmount.value)}`,
            `Avg Price: ${result.execution.avgPrice?.toFixed(4) ?? 'N/A'}`,
            `Shares: ${result.execution.filledShares?.toFixed(4) ?? 'N/A'}`,
            ...result.warnings.map((warning) => `Warning: ${warning}`),
        ].join('\n');
    }
    return [
        '❌ Trade failed',
        `Category: ${result.category}`,
        `Code: ${result.code}`,
        `Message: ${result.message}`,
    ].join('\n');
}
