export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function(...args: Parameters<F>): void {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}