export function nowIso() {
    return new Date().toISOString();
}
export function addSeconds(iso, seconds) {
    return new Date(new Date(iso).getTime() + seconds * 1000).toISOString();
}
export function isExpired(expiresAt) {
    return Date.now() > new Date(expiresAt).getTime();
}
export function ageSeconds(iso) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
}
