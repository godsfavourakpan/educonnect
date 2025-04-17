import { AxiosResponse } from "axios";

export const requestHandler = async <T>(
  request: Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw error;
  }
};
