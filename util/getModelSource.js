/**
 * Returns the appropriate model source URL based on the environment configuration.
 *
 * @param {string} localPath - The local path to the model.
 * @param {string} cdnPath - The CDN path to the model.
 * @returns {string} The full URL to the model.
 */
export default function getModelSource(localPath, cdnPath) {
    const source = process.env.NEXT_PUBLIC_MODEL_SOURCE;

    // If only a local path is provided, use it regardless of the source setting, this means CDN folder structure is the same as local structure
    if (localPath && !cdnPath) {
        switch (source) {
            case "CDN":
                return `${process.env.NEXT_PUBLIC_CDN}games/School Run/public/models/${localPath}`;
            case "Local":
                return `models/${localPath}`;
            default:
                console.warn(
                    `Unknown model source: ${source} - defaulting to local model.`,
                );
                return `${localPath}`;
        }
    }

    switch (source) {
        case "CDN":
            return `${process.env.NEXT_PUBLIC_CDN}${cdnPath}`;
        case "Local":
            return `${localPath}`;
        default:
            console.warn(
                `Unknown model source: ${source} - defaulting to local model.`,
            );
            return `${localPath}`;
    }
}
