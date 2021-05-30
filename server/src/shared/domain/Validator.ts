export class Validators {
    public static isValidURL = (url: string): boolean => {
        // Just simple tests for now
        const okStarts = ['https://', 'http://'];
        for (const start of okStarts) {
            if (url.startsWith(start)) {
                return true;
            }
        }
        return false;
    };
}
