import { AxiosError } from 'axios';

export const handleAxiosError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with an error status code
    const message = error.response.data?.message || 'An error occurred with the request';
    throw new Error(Array.isArray(message) ? message[0] : message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('No response received from server');
  } else {
    // Error setting up the request
    throw new Error(error.message || 'Error setting up the request');
  }
};