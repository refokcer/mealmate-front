import { buildApiUrl } from './apiConfig';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export async function apiRequest(path, { method = 'GET', body, headers, ...rest } = {}) {
  const url = buildApiUrl(path);
  const config = {
    method,
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const buildResourceUrl = (endpoint, suffix = '') => {
  const path = `${endpoint}${suffix}`;
  return buildApiUrl(path);
};

