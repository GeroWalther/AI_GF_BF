export const post = async (url: string, data: unknown = {}) => {
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Network Error:', {
      message: error.message,
      url,
      data
    });
    throw error;
  }
};