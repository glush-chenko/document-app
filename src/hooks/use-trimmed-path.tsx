import {useLocation} from "react-router-dom";
import {useCallback} from "react";

export const useTrimmedPath = () => {
    const location = useLocation();

    return useCallback((basePath: string, customPath?: string) => {
        const fullPath = customPath || location.pathname;

        const basePathIndex = fullPath.indexOf(basePath);

        if (basePathIndex === -1) {
            return decodeURIComponent(fullPath);
        }

        let trimmedPath = fullPath.slice(basePathIndex + basePath.length);

        if (trimmedPath.endsWith("/")) {
            trimmedPath = trimmedPath.slice(0, -1);
        }

        return decodeURIComponent(trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath);
    }, [location.pathname])
};