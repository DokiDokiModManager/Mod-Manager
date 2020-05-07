/**
 * Returns a string that contains information about the user's platform
 * Used in Discord Rich Presence
 */
export default function getDebugString() {
    return process.platform + "-" + process.arch;
}
