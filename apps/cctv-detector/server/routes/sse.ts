import { defineEventHandler } from 'h3';
import { downloadImage } from '../../utils/imageDownloader';
import { detectHumans } from '../../utils/moondreamClient';

// Configuration for image source
const config = {
    imageUrl: process.env.CAMERA_IMAGE_URL,
    username: process.env.CAMERA_USERNAME,
    password: process.env.CAMERA_PASSWORD,
    checkInterval: process.env.CAMERA_CHECK_INTERVAL || 5000,
};

// Function to check image and notify clients
async function checkImage(): Promise<string> {
    try {
        // Download image using digest auth
        const imageBuffer = await downloadImage({
            url: config.imageUrl,
            username: config.username,
            password: config.password
        });

        // Process image with Moondream
        const hasHumans = await detectHumans(imageBuffer);

        // Prepare data to send to clients
        const data = JSON.stringify({
            timestamp: new Date().toISOString(),
            hasHumans,
        });

        return data;
    } catch (error) {
        console.error('Error processing image:', error);
        // Notify clients of error
        const errorData = JSON.stringify({
            timestamp: new Date().toISOString(),
            error: 'Failed to process image'
        });

        return errorData;
    }
}

// SSE endpoint handler
export default defineEventHandler((event) => {
    // Set headers for SSE
    event.node.res.setHeader('Content-Type', 'text/event-stream');
    event.node.res.setHeader('Cache-Control', 'no-cache');
    event.node.res.setHeader('Connection', 'keep-alive');
    event.node.res.setHeader('Access-Control-Allow-Origin', '*');

    const eventStream = createEventStream(event)

    const interval = setInterval(async () => {
        await eventStream.push(await checkImage())
    }, Number(config.checkInterval));

    eventStream.onClosed(async () => {
        clearInterval(interval)
        await eventStream.close()
    })

    return eventStream.send()
});