import { defineEventHandler } from 'h3';

import { downloadImage } from '../../utils/imageDownloader';
import { detectHumans } from '../../utils/moondreamClient';
import { env } from '../../utils/env';

// Configuration for image source
const config = {
    imageUrl: env.CAMERA_IMAGE_URL,
    username: env.CAMERA_USERNAME,
    password: env.CAMERA_PASSWORD,
    checkInterval: env.CHECK_INTERVAL || 5000,
    authDigest: env.AUTH_DIGEST
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

        // convert image to base64
        const imageBase64 = imageBuffer.toString('base64');
        const imageSrc = `data:image/jpeg;base64,${imageBase64}`; // Adjust the MIME type as needed

        // Prepare data to send to clients
        const data = JSON.stringify({
            timestamp: new Date().toISOString(),
            hasHumans,
            imageSrc
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
    event.node.res.setHeader('Content-Encoding', 'none');
    event.node.res.setHeader('Access-Control-Allow-Origin', '*');

    // if OPTIONS request, return 200
    if (event.node.req.method === 'OPTIONS') {
        event.node.res.statusCode = 200;
        event.node.res.end();
        return 'OK';
    }

    // check for auth
    if (event.node.req.headers.authorization !== `Bearer ${config.authDigest}`) {
        event.node.res.statusCode = 401;
        event.node.res.end();
        return 'Unauthorized';
    }

    const eventStream = createEventStream(event)

    const interval = setInterval(async () => {
        await eventStream.push(await checkImage())
    }, config.checkInterval);

    eventStream.onClosed(async () => {
        clearInterval(interval)
        await eventStream.close()
    })

    return eventStream.send()
});