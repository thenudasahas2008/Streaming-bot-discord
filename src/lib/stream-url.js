'use strict';

const ALLOWED_HOSTS = new Set([
    'twitch.tv',
    'www.twitch.tv',
    'm.twitch.tv',
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'www.youtube-nocookie.com'
]);

function validateStreamUrl(input) {
    if (typeof input !== 'string' || input.trim().length === 0) {
        return { valid: false, reason: 'Please provide a URL.' };
    }

    let parsed;
    try {
        parsed = new URL(input.trim());
    } catch {
        return { valid: false, reason: 'Invalid URL format.' };
    }

    if (parsed.protocol !== 'https:') {
        return { valid: false, reason: 'Only HTTPS URLs are supported.' };
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
        return {
            valid: false,
            reason: 'Only valid Twitch or YouTube stream links are supported.'
        };
    }

    if (parsed.username || parsed.password) {
        return { valid: false, reason: 'Credentials or userinfo in URLs are not allowed.' };
    }

    return {
        valid: true,
        url: parsed.toString()
    };
}

module.exports = { validateStreamUrl };
