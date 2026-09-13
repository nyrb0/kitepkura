// Admin deadline inputs always use Bishkek time (UTC+06:00).
export function deadlineToInput(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function deadlineToIso(value: string): string {
    return value ? new Date(`${value}+06:00`).toISOString() : '';
}

export function validateDeadline(value: string): true | string {
    return !value || !Number.isNaN(new Date(`${value}+06:00`).getTime()) || 'Укажите корректную дату и время';
}
