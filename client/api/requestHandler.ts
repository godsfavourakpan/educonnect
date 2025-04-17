import { AxiosResponse, AxiosError } from "axios";

export async function requestHandler<T>(
  request: Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || error.message || "Request failed"
      );
    }
    throw error;
  }
}
