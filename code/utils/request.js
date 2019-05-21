import * as Mock from './mock';

const DEFAULT_REQUEST_OPTIONS = {
  url: '',
  data: {},
  header: {
    "Content-Type": "application/json"
  },
  method: 'GET',
  dataType: 'json'
};

/**
 * 封装网络请求
 */
export default function request(url, options = {}) {
  const opt = { ...DEFAULT_REQUEST_OPTIONS, ...options };
  const { data, header, method, dataType, mock = false } = opt
  return new Promise((resolve, reject) => {
    if (mock) {
      const res = {
        statusCode: 200,
        data: Mock[url]
      }
      if (res && res.statusCode == 200 && res.data) {
        resolve(res.data);
      } else {
        reject(res);
      }
    } else {
      wx.request({
        url,
        data,
        header,
        method,
        dataType,
        success: function (res) {
          if (res && res.statusCode == 200 && res.data) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: function (err) {
          reject(err);
        }
      });
    }
  });
}