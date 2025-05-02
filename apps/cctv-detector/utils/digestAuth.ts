import DigestFetch from 'digest-fetch';

/**
 * Interface for digest authentication options
 */
interface DigestAuthOptions {
    url: string;
    username: string;
    password: string;
    method?: string;
}

/**
 * Implements HTTP Digest Authentication using the digest-fetch library
 * 
 * @param options Authentication options including URL and credentials
 * @returns Promise with the authenticated response
 */
export async function fetchWithDigestAuth(options: DigestAuthOptions) {
    const { url, username, password, method = 'GET' } = options;

    // Create a DigestFetch client with the provided credentials
    const client = new DigestFetch(username, password);

    // Make the request with digest authentication
    return client.fetch(url, { method });
}