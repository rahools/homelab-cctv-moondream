import { vl } from 'moondream';

/**
 * Sends an image to the Moondream API to detect if there are humans in the image
 * 
 * @param imageBuffer The image data as a Buffer
 * @returns Promise<boolean> True if humans are detected, false otherwise
 */
export async function detectHumans(imageBuffer: Buffer): Promise<boolean> {
    try {
        // Get the API key from environment variables
        const apiKey = process.env.MOONDREAM_API_KEY;
        if (!apiKey) {
            throw new Error('MOONDREAM_API_KEY environment variable is not set');
        }

        // Initialize the Moondream client with cloud API
        const model = new vl({
            apiKey: apiKey
        });

        // Query the model to detect humans
        const result = await model.query({
            image: imageBuffer,
            question: 'Are there any humans in this image? Return only true or false.',
            stream: false
        });

        console.log('Moondream detection result:', result);

        // Parse the result to determine if humans are present
        const answer = String(result).toLowerCase() || '';
        return answer.includes('true');
    } catch (error) {
        console.error('Error detecting humans:', error);
        // Default to false on error to avoid false positives
        return false;
    }
}