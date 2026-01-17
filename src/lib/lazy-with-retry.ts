import { lazy, ComponentType } from "react";

/**
 * A wrapper for React.lazy that handles dynamic import failures.
 * This is especially useful for handling 'Failed to fetch dynamically imported module'
 * errors which occur when a new version of the app is deployed and old chunks are removed.
 */
export const lazyWithRetry = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem("page-has-been-force-refreshed") || "false"
        );

        try {
            const component = await componentImport();
            window.sessionStorage.setItem("page-has-been-force-refreshed", "false");
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // The error is likely due to a stale chunk
                console.error("Chunk load failed, forcing reload:", error);
                window.sessionStorage.setItem("page-has-been-force-refreshed", "true");
                window.location.reload();
                return { default: () => null } as any; // Return an empty component while reloading
            }

            // If we already tried to refresh and it still fails, bubble up the error
            console.error("Critical: Chunk load failed even after reload:", error);
            throw error;
        }
    });
