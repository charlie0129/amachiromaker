import axios from 'axios';
import consts from './consts';

const service = axios.create({
  baseURL: "",
  timeout: 10000,
  headers: {},
});

export function get<T>(url: string, data: object = {}) {
  return new Promise<T>((resolve, reject) => {
    service.get(url, { params: data })
      .then((res: { data: T }) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function post<T>(url: string, data: object = {}) {
  return new Promise<T>((resolve, reject) => {
    service.post(url, data)
      .then((res: { data: T }) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function put<T>(url: string, data: object = {}) {
  return new Promise<T>((resolve, reject) => {
    service.put(url, data)
      .then((res: { data: T }) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function del<T>(url: string, data: object = {}) {
  return new Promise<T>((resolve, reject) => {
    service.delete(url, { params: data })
      .then((res: { data: T }) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export default {
  get, post, put, del,
};