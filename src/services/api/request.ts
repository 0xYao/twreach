import axios, { AxiosRequestHeaders } from 'axios'

export const requestWrapper = (
  BASE_API_URL: string,
  params?: {
    headers: AxiosRequestHeaders
  }
) => {
  return async <T>(
    url: string,
    data?: {
      data?: any
      params?: string | Record<string, unknown>
      method?: 'post' | 'get' | 'delete'
      headers?: AxiosRequestHeaders
    }
  ): Promise<T> => {
    return axios({
      ...data,
      headers: {
        ...params?.headers,
        ...data?.headers,
      },
      url: BASE_API_URL + url,
    }).then((res) => res.data)
  }
}
