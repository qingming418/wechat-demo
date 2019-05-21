'use strict';

import util from '../../utils/index';
import config from '../../utils/config';
import request from '../../utils/request';
import moment from '../../miniprogram_npm/moment/index';

const app = getApp();
const isDEV = config.isDev;
const todayStr = moment().format("YYYY-MM-DD");
const todayYear = parseInt((todayStr.split('-'))[0]);

// 格式化数据函数
const formatArticleData = data => {
  let formatData = undefined;
  const dateConvert = dateStr => {
    if (!dateStr) {
      return '';
    }
    const splitStr = dateStr.split('-');
    if (todayStr === dateStr) {
      return '今日';
    } else if (todayYear > splitStr[0]) {
      return `${splitStr[0]}年${splitStr[1]}月${splitStr[2]}日`;
    } else {
      return dateStr.slice(5).replace('-', '月') + '日';
    }
  };
  const isVisited = contentId => {
    let visitedArticles = app.globalData.visitedArticles || [];
    return visitedArticles.includes(contentId);
  };
  if (data && data.length) {
    formatData = data.map(group => {
      // 格式化日期
      group.formateDate = dateConvert(group.date);
      if (group.articles) {
        const formatArticleItems = group.articles.map(item => {
          // 判断是否已经访问过
          item.hasVisited = isVisited(item.contentId);
          return item;
        });
        group.articles = formatArticleItems;
      }
      return group
    })
  }
  return formatData;
};

// 后继的代码都会放在此对象中
const handler = {
  data: {
    page: 1, //当前加载第几页的数据
    days: 3,
    pageSize: 4,
    totalSize: 0,
    hasMore: true,// 用来判断下拉加载更多内容操作
    articleList: [], // 存放文章列表数据，与视图相关联
    defaultImg: config.defaultImg,
    hiddenLoading: false
  },
  onLoad(options) {
    this.requestArticle()
  },
  /*
   * 下拉更新数据
   */
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      });
      this.requestArticle();
    }
  },
  /*
   * 分享后的回调
   */
  onShareAppMessage() {
    let title = config.defaultShareText || '';
    return {
      title: title,
      path: `/pages/index/index`,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /*
   * 点击详情触发
   */
  showDetail(e) {
    const dataset = e.currentTarget.dataset;
    const item = dataset && dataset.item;
    const contentId = item.contentId || 0;
    this.markRead(contentId);
    wx.navigateTo({
      url: `../detail/detail?contentId=${contentId}`
    });
  },
  /*
   * 标记文章已读
   */
  markRead(contentId) {
    const self = this;
    util.getStorageData('visited', data => {
      const newStorage = [];
      const oriStorage = data ? data.split(',') : [];
      // 如果之前没有缓存或则缓存不包括contentId
      if (!oriStorage.includes(contentId)) {
        newStorage.push(contentId);
      }
      if (newStorage.length > 0) {
        const store = [...oriStorage, ...newStorage];
        app.globalData.visitedArticles = store;
        util.setStorageData('visited', store.join(','), () => {
          const old = self.data.articleList;
          const newArticles = formatArticleData(old);
          self.setData({
            articleList: newArticles
          });
        });
      }
    });
  },
  /*
   * 获取文章列表数据
   */
  requestArticle() {
    request('list', {
      mock: true,
      data: {
        tag: '微信热门',
        start: this.data.page || 1,
        days: this.data.days || 3,
        pageSize: this.data.pageSize,
        langs: config.appLang || 'en'
      }
    }).then(res => {
      if (res && res.status === 0) {
        if (res.data.length > 0) {
          // 正常数据 do something
          const formatData = formatArticleData(res.data);
          const newList = this.data.articleList.concat(formatData);
          this.setData({
            articleList: newList,
            hiddenLoading: true
          })
        }
        if (res.data.length === 0) {
          this.setData({
            hasMore: false
          });
          if (this.data.page === 1) {
            util.alert();
          }
        }
      } else {
        // 响应错误
        util.alert('提示', res);
        this.setData({
          hasMore: false
        });
        return null;
      }
    });
  }
}

Page(handler);