export const useReplaceAfterLastSlash = () => {
    return (str: string, replacement: string) => {
        const lastSlashIndex = str.lastIndexOf('/');
        if (lastSlashIndex === -1) {
            return str;
        }
        return str.substring(0, lastSlashIndex + 1) + replacement;
    }
}