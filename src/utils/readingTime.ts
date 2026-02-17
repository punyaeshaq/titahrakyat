/**
 * Strip HTML tags from content and calculate reading time.
 * Average reading speed: ~200 words per minute.
 */
export const calculateReadingTime = (html: string): number => {
    // Strip HTML tags to get plain text
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return 1;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return Math.max(1, time); // Minimum 1 minute
};
