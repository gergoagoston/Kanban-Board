import axios from 'axios';

export const axiosErrorHandler = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('API error:', error.response);
      return error.response.data.error || 'An error occurred. Please try again.';
    } else {
      return 'No response received from the server. Please check your connection.';
    }
  } else {
    return 'An unexpected error occurred.';
  }
};
