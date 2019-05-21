'use strict';

import util from './utils/index';

let handler = {
  //小程序初始化
  onLaunch() {
    // 获取已经阅读的文章
    util.getStorageData('visited', (data) => {
      this.globalData.visitedArticles = data ? data.split(',') : [];
    });
    // 获取客户端信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.deviceInfo = { SDKVersion: res.SDKVersion };
      }
    });
  },
  //小程序全局数据
  globalData: {
    // 阅读过的文章字符串
    visitedArticles: [],
    // 客户端版本
    deviceInfo: {}
  }
};
App(handler);