'use strict';
const env = 'dev';// dev production
/*
 * 默认接口出错弹窗文案
 * @type {string}
 */
const defaultAlertMsg = '好像哪里出了小问题~ 请再试一次~';
/*
 * 默认分享文案
 * @type {{en: string}}
 */
const defaultShareText = {
  en: 'iKcamp英语-学英语口语听力四六级',
  zh_CN: '分享一下呗'
};
/*
 * 小程序默认标题栏文字
 * @type {string}
 */
const defaultBarTitle = {
  en: 'iKcamp英语学习',
  zh_CN: 'iKcamp英语学习'
};
/*
 * 文章默认图片
 * @type {string}
 */
const defaultImg = {
  articleImg: 'https://n1image.hjfile.cn/mh/2017/06/07/7e8f7b63dba6fa3849b628c0ce2c2a46.png',
  coverImg: 'https://n1image.hjfile.cn/mh/2017/06/07/7472c035ad7fe4b8db5d2b20e84f9374.png'
};

export default {
  env,
  defaultBarTitle: defaultBarTitle['zh_CN'],
  defaultImg,
  defaultAlertMsg,
  defaultShareText: defaultShareText['zh_CN'],
  isDev: env === 'dev',
  isProduction: env === 'production'
};