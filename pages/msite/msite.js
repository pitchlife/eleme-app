import { guess, getGeo, getNearby } from "../../utils/api"
import { debounce } from "../../utils/common"
const app = getApp()
Page({
  data: {
    currentAddress: '',
    list: []
  },
  onLoad() {
    this.getAddress()
  },
  getAddress() {
    guess(res => {
      getGeo(res.latitude, res.longitude, res => {
        this.setData({
          currentAddress: res
        })
        wx.setStorage({
          key: "__address__",
          data: res
        })
      })
    })
  },
  search(e) {
    if (!e.detail.value) {
      this.setData({
        list: []
      })
      return
    }
    let geohash = app.globalData.address.geohash
    let keyword = e.detail.value
    getNearby(geohash, keyword, 20, res => {
      console.log(res)
      this.setData({
        list: res
      })
    })
  },
  setAddress(e) {
    console.log(e.currentTarget.dataset.address)
    wx.setStorage({
      key: "__address__",
      data: e.currentTarget.dataset.address
    })
    app.globalData.address = e.currentTarget.dataset.address
    setTimeout(()=>{
      wx.switchTab({
        url: '/pages/index/index'
      })
    },100)
  }
})