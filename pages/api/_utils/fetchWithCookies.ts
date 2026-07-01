import { NextApiRequest } from 'next';

const CORE_URL = process.env.NEXT_PUBLIC_CORE_API_URL;

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Creates a fetch function that automatically forwards cookies and auth headers
 * from the incoming request to the external API
 */
export function createApiClient(req: NextApiRequest) {
  const cookies = req.headers.cookie || '';
  const authorization = req.headers.authorization || '';

  return async function fetchWithCookies(
    endpoint: string,
    options: FetchOptions = {}
  ) {
    const { method = 'GET', body, headers = {} } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: cookies,
        ...(authorization && { Authorization: authorization }),
        ...headers,
      },
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${CORE_URL}/${endpoint}`;

    return fetch(url, fetchOptions);
  };
}

/**
 * Helper to handle API responses consistently
 */
export async function handleApiResponse(res: Response, nextRes: any) {
  const data = await res.json();

  // Forward any Set-Cookie headers from the external API
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    nextRes.setHeader('Set-Cookie', setCookieHeader);
  }

  if (!res.ok) {
    return nextRes.status(res.status).json(data);
  }

  return nextRes.status(200).json(data);
}
