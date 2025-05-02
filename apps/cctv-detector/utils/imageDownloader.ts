import { fetchWithDigestAuth } from './digestAuth';

interface DownloadOptions {
    url: string;
    username: string;
    password: string;
}

/**
 * Downloads an image from a URL using digest authentication
 * 
 * @param options.url - The URL of the image to download
 * @param options.username - Username for digest authentication
 * @param options.password - Password for digest authentication
 * @returns Promise<Buffer> - The downloaded image as a buffer
 */
export async function downloadImage(options: DownloadOptions): Promise<Buffer> {
    const { url, username, password } = options;

    try {
        // Use digest authentication to download the image
        const response = await fetchWithDigestAuth({
            url,
            username,
            password,
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }

        // Convert response to buffer
        return Buffer.from(await response.arrayBuffer());
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}