//index.js
//获取应用实例
const app = getApp()
import { guess, getWeather, getGeo, getHotSearchWords, getEntries, getShops } from "../../utils/api"
import { normalURL } from "../../utils/common"
Page({
  data: {
    currentAddress: '',
    currentCity: '',
    weather: '',
    HotWords: [],
    entries: [],
    shops: [],
    limit: 5,
    offset: 0,
    isLoading: false,
    hasMore: true,
    loadText: "正在加载更多商家...",
    wHeight: 0,
    scrolltop: 0,
    flag: false
  },
  //事件处理函数
  moveToTop(e) {
    this.setData({
      scrolltop: 0
    })
  },
  onScroll(e) {
    if (e.detail.scrollTop >= 300) {
      this.setData({
        flag: true
      })
    } else {
      this.setData({
        flag: false
      })
    }
  },
  bindViewTap() {
    wx.navigateTo({
      url: '/pages/msite/msite'
    })
  },
  loadmore() {
    if (this.data.hasMore) {
      if (!this.data.isLoading) {
        this._getShops(this.data.currentAddress.latitude, this.data.currentAddress.longitude, this.data.limit, this.data.offset);
      }
    }
  },
  onShow () {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          wHeight: res.windowHeight
        })
      }
    })
    if (app.globalData.address) {
      this.setData({
        currentAddress: app.globalData.address
      })
      //获取热门搜索
      this._getHotSearchWords(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取天气
      this._getWeather(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取分类
      this._getEntries(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取推荐商家
      this._getShops(this.data.currentAddress.latitude, this.data.currentAddress.longitude, this.data.limit, this.data.offset)
    } else {
      guess(res => {
        console.log(res)
        this.setData({
          currentCity: res
        })
        //获取当前位置
        getGeo(this.data.currentCity.latitude, this.data.currentCity.longitude, resp => {
          this.setData({
            currentAddress: resp
          })
          app.globalData.address = resp
          wx.setStorage({
            key: "__address__",
            data: resp
          })
        })
        //获取热门搜索
        this._getHotSearchWords(this.data.currentCity.latitude, this.data.currentCity.longitude)
        //获取天气
        this._getWeather(this.data.currentCity.latitude, this.data.currentCity.longitude)
        //获取分类
        this._getEntries(this.data.currentCity.latitude, this.data.currentCity.longitude)
      })
    }
  },
  /*onLoad() {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          wHeight: res.windowHeight
        })
      }
    })
    if (app.globalData.address) {
      this.setData({
        currentAddress: app.globalData.address
      })
      //获取热门搜索
      this._getHotSearchWords(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取天气
      this._getWeather(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取分类
      this._getEntries(this.data.currentAddress.latitude, this.data.currentAddress.longitude)
      //获取推荐商家
      this._getShops(this.data.currentAddress.latitude, this.data.currentAddress.longitude, this.data.limit, this.data.offset)
    } else {
      guess(res => {
        console.log(res)
        this.setData({
          currentCity: res
        })
        //获取当前位置
        getGeo(this.data.currentCity.latitude, this.data.currentCity.longitude, resp => {
          this.setData({
            currentAddress: resp
          })
          app.globalData.address = resp
          wx.setStorage({
            key: "__address__",
            data: resp
          })
        })
        //获取热门搜索
        this._getHotSearchWords(this.data.currentCity.latitude, this.data.currentCity.longitude)
        //获取天气
        this._getWeather(this.data.currentCity.latitude, this.data.currentCity.longitude)
        //获取分类
        this._getEntries(this.data.currentCity.latitude, this.data.currentCity.longitude)
      })
    }
  },*/
  _getHotSearchWords(latitude, longitude) {
    getHotSearchWords(latitude, longitude, res => {
      this.setData({
        HotWords: res
      })
    })
  },
  _getWeather(latitude, longitude) {
    getWeather(latitude, longitude, res => {
      res.image_hash = normalURL(res.image_hash)
      this.setData({
        weather: res
      })
    })
  },
  _getEntries(latitude, longitude) {
    getEntries(latitude, longitude, res => {
      res[0].entries.forEach(item => {
        item.image_hash = normalURL(item.image_hash)
        item.ids = this.getCategoryIds(item.link)
      })
      this.setData({
        entries: res[0].entries
      })
      console.log(this.data.entries)
    })
  },
  _getShops(latitude, longitude, limit, offset ) {
    this.setData({
      isLoading: true
    })
    getShops(latitude, longitude, limit, offset, res => {
      this.setData({
        isLoading: false
      })
      res.forEach(item => {
        item.image_path = normalURL(item.image_path)
      })

      this.setData({
        shops: this.data.shops.concat(res)
      })
      if (res.length == this.data.limit) {
        this.setData({
          hasMore: true
        })
        this.data.offset += this.data.limit;
      } else {
        this.setData({
          hasMore: false,
          loadText: '没有更多了，试试<navigator url="/pages/msite/msite" hover-class="navigator-hover">搜索</navigator>吧'
        })
      }
      console.log(this.data.shops)
    })
  },
  getCategoryIds(url) {
    let urlData = decodeURIComponent(url.split('=')[1].replace('&target_name', ''));
    if (/restaurant_category_id/gi.test(urlData)) {
      return JSON.parse(urlData).category_schema.complex_category_ids
    } else {
      return ''
    }
  },
  callBack(res) {
    this.setData({
      currentCity: res
    })
  }
})
