import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpMethod, RequestHeader, ApiResponse } from '../types';

export const sendRequest = async (
  url: string,
  method: HttpMethod,
  headers: RequestHeader[],
  body: string
): Promise<ApiResponse> => {
  const startTime = performance.now();
  
  const config: AxiosRequestConfig = {
    url,
    method,
    headers: headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>),
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    try {
      config.data = JSON.parse(body);
    } catch (e) {
      config.data = body;
    }
  }
  
  try {
    const response: AxiosResponse = await axios(config);
    const endTime = performance.now();
    
    // Calculate response size (approximate)
    const responseText = JSON.stringify(response.data);
    const size = new Blob([responseText]).size;
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      data: response.data,
      time: Math.round(endTime - startTime),
      size
    };
  } catch (error: any) {
    const endTime = performance.now();
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const responseText = JSON.stringify(error.response.data);
      const size = new Blob([responseText]).size;
      
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers as Record<string, string>,
        data: error.response.data,
        time: Math.round(endTime - startTime),
        size
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        statusText: error.message || 'Network Error',
        headers: {},
        data: { error: error.message },
        time: Math.round(endTime - startTime),
        size: 0
      };
    }
  }
};