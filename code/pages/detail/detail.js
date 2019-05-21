'use strict';

import util from '../../utils/index';
import config from '../../utils/config';
import request from '../../utils/request';
import moment from '../../miniprogram_npm/moment/index';

// WxParse HtmlFormater 用来解析 content 文本为小程序视图
import WxParse from '../../lib/wxParse/wxParse';
// 把 html 转为化标准安全的格式
import HtmlFormater from '../../lib/htmlFormater';

let app = getApp();

Page({
  data: {
    scrollTop: 0,
    detailData: {}
  },
  /*
   * 其内部的 `option` 是路由跳转过来后的参数对象。
   * 从 `option` 中解析出文章参数 `contendId`，然后通过调用 `util` 中封装好的 `request` 函数来获取 `mock` 数据。 
   */
  onLoad(option) {
    const contentId = option.contentId || '0';
    this.setData({
      isFromShare: !!option.share
    });
    this.configPageData(contentId);
  },
  goTop() {
    this.setData({
      scrollTop: 0
    })
  },
  configPageData(contentId) {
    if (contentId) {
      request('detail', {
        mock: true,
        data: {
          sourceId: contentId
        }
      }).then(res => {
        if (res && res.status === 0) {
          this.goTop();
          // 格式化后的时间
          const data = res.data;
          data.formateUpdateTime = moment(res.data.lastUpdateTime).format('YYYY/MM/DD');
          this.setData({
            detailData: data
          });
          //设置标题
          const title = data.title || config.defaultBarTitle
          wx.setNavigationBarTitle({
            title,
          });
          const htmlContent = data.content;
          // 第一个参数 article 很重要，在 WxParse 中，我们传入了当前对象 this
          // 当变量 htmlContent 解析之后，会把解析后的数据赋值给当前对象，并命名为 article
          // 数据解析后，当前环境上下文中已经存在了数据 this.data.article，可以直接在 detail.wxml 中引用
          WxParse.wxParse('article', 'html', htmlContent, this, 0);
        }
      })
    }
  },
  next() {
    this.requestNextContentId()
      .then(data => {
        const contentId = data && data.contentId || '0';
        this.configPageData(contentId);
      })
  },
  requestNextContentId() {
    let pubDate = this.data.detailData && this.data.detailData.lastUpdateTime || ''
    let contentId = this.data.detailData && this.data.detailData.contentId || 0
    return request('detail', {
      mock: true,
      data: {
        tag: '微信热门',
        pubDate: pubDate,
        contentId: contentId,
        langs: config.appLang || 'en'
      }
    }).then(res => {
      if (res && res.status === 0 && res.data && res.data.contentId) {
        return res.data;
      } else {
        util.alert('提示', '没有更多文章了!')
        return null
      }
    })
  },
  onShareAppMessage() {
    let title = this.data.detailData && this.data.detailData.title || config.defaultShareText;
    let contentId = this.data.detailData && this.data.detailData.contentId || '0';
    return {
      // 分享出去的内容标题
      title: title,
      // 用户点击分享出去的内容，跳转的地址
      // contentId为文章id参数；share参数作用是说明用户是从分享出去的地址进来的，我们后面会用到
      path: `/pages/detail/detail?share=1&contentId=${contentId}`,
      // 分享成功
      success: function (res) { },
      // 分享失败
      fail: function (res) { }
    }
  },
  notSupportShare() {
    // deviceInfo 是用户的设备信息，我们在 app.js 中已经获取并保存在 globalData 中
    const device = app.globalData.deviceInfo;
    const sdkVersion = device && device.SDKVersion || '1.0.0';
    return /1\.0\.0|1\.0\.1|1\.1\.0|1\.1\.1/.test(sdkVersion);
  },
  share() {
    if (this.notSupportShare()) {
      wx.showModal({
        title: '提示',
        content: '您的微信版本较低，请点击右上角分享'
      })
    }
  },
  // 返回
  back() {
    if (this.data.isFromShare) {
      wx.navigateTo({
        url: '../index/index'
      })
    } else {
      wx.navigateBack();
    }
  }
})