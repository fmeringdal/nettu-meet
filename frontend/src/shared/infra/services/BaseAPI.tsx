import axios, { AxiosInstance } from "axios";
import { apiConfig } from "../../../config/api";

export abstract class BaseAPI {
  protected baseUrl: string;
  private axiosInstance: AxiosInstance | any = null;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.axiosInstance = axios.create({});
    this.enableInterceptors();
  }

  private enableInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      this.getSuccessResponseHandler(),
      this.getErrorResponseHandler()
    );
  }

  private getSuccessResponseHandler() {
    return (response: any) => {
      return response;
    };
  }

  private getErrorResponseHandler() {
    return async (error: any) => {
      return Promise.reject({ ...error });
    };
  }

  protected get(url: string, params?: any, headers?: any): Promise<any> {
    return this.axiosInstance({
      method: "GET",
      url: `${this.baseUrl}${url}`,
      params: params ? params : null,
      headers: headers ? headers : null,
    });
  }

  protected post(
    url: string,
    data?: any,
    params?: any,
    headers?: any
  ): Promise<any> {
    return this.axiosInstance({
      method: "POST",
      url: `${this.baseUrl}${url}`,
      data: data ? data : null,
      params: params ? params : null,
      headers: headers ? headers : null,
    });
  }

  protected put(
    url: string,
    data?: any,
    params?: any,
    headers?: any
  ): Promise<any> {
    return this.axiosInstance({
      method: "PUT",
      url: `${this.baseUrl}${url}`,
      data: data ? data : null,
      params: params ? params : null,
      headers: headers ? headers : null,
    });
  }

  protected delete(
    url: string,
    data?: any,
    params?: any,
    headers?: any
  ): Promise<any> {
    return this.axiosInstance({
      method: "DELETE",
      url: `${this.baseUrl}${url}`,
      data: data ? data : null,
      params: params ? params : null,
      headers: headers ? headers : null,
    });
  }
}
