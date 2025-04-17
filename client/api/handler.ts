export const requestHandler = async <T>(
  apiCall: Promise<{ data: T }>
): Promise<T> => {
  try {
    const { data } = await apiCall;
    return data;
  } catch (error) {
    console.error("API request error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred");
  }
};
