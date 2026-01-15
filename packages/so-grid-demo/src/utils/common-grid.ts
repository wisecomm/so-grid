export class CommonGrid {
    static formatCurrency({ value }: { value: number }) {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    }

    static formatNumber({ value }: { value: number }) {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('en-US').format(value);
    }
}
