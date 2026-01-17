import type { AdditionalCurrency } from '../types';

export const formatCurrency = (amount: number, currency: string, options?: { showSecondary?: boolean, secondaryCurrency?: string, exchangeRate?: number, additionalCurrencies?: AdditionalCurrency[] }): string => {
    const formattedPrimary = formatSingleCurrency(amount, currency);

    if (options?.showSecondary) {
        const parts = [formattedPrimary];

        // Legacy Dual Currency (Primary Secondary)
        if (options.secondaryCurrency && options.exchangeRate) {
            const secondaryAmount = amount * options.exchangeRate;
            const isRiel = options.secondaryCurrency === '៛' || options.secondaryCurrency === 'KHR';
            parts.push(formatSingleCurrency(secondaryAmount, options.secondaryCurrency, isRiel ? 0 : 2));
        }

        // Additional Multi-Currencies
        if (options.additionalCurrencies && options.additionalCurrencies.length > 0) {
            options.additionalCurrencies.forEach(curr => {
                const amountCalc = amount * curr.exchangeRate;
                // Simple heuristic: if rate > 100 or is KHR, assume 0 decimals.
                const isNoDecimal = curr.exchangeRate > 100 || curr.symbol === '៛' || curr.symbol === 'KHR';
                parts.push(formatSingleCurrency(amountCalc, curr.symbol, isNoDecimal ? 0 : 2));
            });
        }

        return parts.join(' / ');
    }

    return formattedPrimary;
};

const formatSingleCurrency = (amount: number, currency: string, fractionDigits = 2): string => {
    // Special handling for Riel (KHR) suffix
    if (currency === '៛' || currency === 'KHR') {
        return `${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)} ${currency}`;
    }

    // Default left-side symbol ($, €, etc.)
    return `${currency}${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount)}`;
};
