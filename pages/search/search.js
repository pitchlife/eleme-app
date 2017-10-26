// pages/search/search.js
const app = getApp()
import { getHotSearchWords, searchRestaurants, getCategory } from "../../utils/api"
import { debounce, normalURL } from "../../utils/common"

Page({
  data: {
    HotWords: [],
    keyword: '',
    searchHistory: [],
    limit: 5,
    offset: 0,
    results: '',
    arr: [],

  
    offset: 0,
    limit: 20,
    ids: [],
    cateIndex: 0,
    orderbyIndex: 0,
    //filterIndex: 0,
    support_ids: [],
    subCateIndex: 0,
    cateFlag: false,
    orderbyFlag: false,
    filterFlag: false,

    selectedCateName: '',
    selectedCateId: '',

    selectedOrderById: 0,

    cateList: [],
    subCate: [],
    orderbyList: [
      {
        title: '综合排序',
        id: 0
      },
      {
        title: '销量最高',
        id: 6
      },
      {
        title: '起送价最低',
        id: 1
      },
      {
        title: '配送最快',
        id: 2
      }
    ],

    costList: [
      {
        title: '￥20以下',
        id: 1
      },
      {
        title: '￥20~40',
        id: 2
      },
      {
        title: '￥40以上',
        id: 3
      }
    ],
    activityList: [
      {
        title: '新用户优惠',
        id: 1
      },
      {
        title: '特价商品',
        id: 2
      },
      {
        title: '下单立减',
        id: 3
      },
      {
        title: '赠品优惠',
        id: 4
      },
    ],
    deliveryList: [
      {
        title: '蜂鸟专送',
        id: 1
      },
    ],
    supportList: [
      {
        title: '品牌商家',
        id: 8
      },
      {
        title: '外卖保',
        id: 7
      },
      {
        title: '新店',
        id: 5
      },
      {
        title: '开发票',
        id: 4
      },
      {
        title: '在线支付',
        id: 3
      },
    ],

    obj: { average_cost_ids: '', activity_types: '', delivery_mode: '', support_ids: [] }
  },
  onLoad(options) {
    this.setData({
      searchHistory: app.globalData.searchHistory
    })
    this._getHotSearchWords(app.globalData.address.latitude, app.globalData.address.longitude)
    
    this._getCategory(app.globalData.address.latitude, app.globalData.address.longitude)

    if(options.keyword){
      this.setData({
        keyword: options.keyword
      })
      this._search(app.globalData.address.latitude, app.globalData.address.longitude, options.keyword, this.data.offset, this.data.limit)
    }
    
  },
  _getCategory(latitude, longitude){
    getCategory(latitude, longitude,res=>{
      res.forEach(item => {
        if (item.sub_categories) {
          item.sub_categories.forEach(cate => {
            cate.image_url = normalURL(cate.image_url)
          })
        }
      })
      this.setData({
        cateList: res
      })
    })
  },
  toggleCate() {
    let cateFlag = this.data.cateFlag
    this.setData({
      cateFlag: !cateFlag
    })
    if (this.data.cateFlag) {
      this.data.orderbyFlag = false
      this.data.filterFlag = false
    }
  },
  toggleOrderby() {
    let orderbyFlag = this.data.orderbyFlag
    this.setData({
      orderbyFlag: !orderbyFlag
    })
    if (this.data.orderbyFlag) {
      this.data.cateFlag = false
      this.data.filterFlag = false
    }
  },
  toggleFilter() {
    let filterFlag = this.data.filterFlag
    this.setData({
      filterFlag: !filterFlag
    })
    if (this.data.filterFlag) {
      this.data.cateFlag = false
      this.data.orderbyFlag = false
    }
  },
  selectCate(e) {
    console.log(e)
    let index=e.currentTarget.dataset.index
    let subcategories = e.currentTarget.dataset.subcategories
    let ids = e.currentTarget.dataset.ids
    this.setData({
      cateIndex:index,
      subCate: subcategories,
      ids: ids
    })
  },
  selectSubCate(e) {
    let index = e.currentTarget.dataset.index
    let subcatename = e.currentTarget.dataset.subcatename

    this.setData({
      subCateIndex: index,
      selectedCateName: subcatename,
      cateFlag: false
    })
  },
  costRadioChange (e) {
    console.log(e)
    let filterType = e.target.id
    let filterArr = filterType == "costList" ? this.data.costList : filterType == "activityList" ? this.data.activityList : this.data.deliveryList
    var value = e.detail.value

    var obj = this.data.obj
    for (var i = 0; i < filterArr.length; i++) {
      if (value == filterArr[i].id) {
        filterArr[i].checked = true
      } else {
        filterArr[i].checked = false
      }
    }
    obj.average_cost_ids = value
    filterType == "costList" ? this.setData({ costList: filterArr, obj }) : filterType == "activityList" ? this.setData({ activityList: filterArr, obj }) : this.setData({ deliveryList: filterArr, obj })
  },

  
  _getHotSearchWords(latitude, longitude) {
    getHotSearchWords(latitude, longitude, res => {
      this.setData({
        HotWords: res
      })
    })
  },
  loadmore(){
    console.log("loadmore")
  },
  wordtap(e) {
    console.log(e.currentTarget.dataset.keyword)
    let keyword = e.currentTarget.dataset.keyword
    //如果该搜索历史已经存在于非数组第一位，将其删除并置顶
    let index = this.data.searchHistory.findIndex((item) => {
      return item == keyword
    })
    if (index === 0) {
      
    } else if (index > 0) {
      this.data.searchHistory.splice(index, 1)
      this.data.searchHistory.unshift(keyword)
      this.setData({
        searchHistory: this.data.searchHistory
      })
    } else {
      this.data.searchHistory.push(keyword)
      this.setData({
        searchHistory: this.data.searchHistory
      })
    }

    wx.setStorage({
      key: "__keyword__",
      data: this.data.searchHistory
    })
    this.setData({
      keyword: keyword
    })
    this._search(app.globalData.address.latitude, app.globalData.address.longitude, keyword, this.data.offset, this.data.limit)
  },
  bindKeyInput(e) {
    console.log(e.detail.value)
    let keyword = e.detail.value
    if (keyword){
      this._search(app.globalData.address.latitude, app.globalData.address.longitude, keyword, this.data.offset, this.data.limit)
    }else{
      this.setData({
        results: ''
      })
      return
    }
    
  },
  _search(latitude, longitude, keyword, offset, limit) {
    searchRestaurants(latitude, longitude, keyword, offset, limit, res => {
      res[0].restaurant_with_foods.forEach(item => {
        if (item.foods.length > 0) {
          item.foods.forEach(food => {
            food.image_path = normalURL(food.image_path)
          })
        }
        item.restaurant.image_path = normalURL(item.restaurant.image_path)
      })
      
      this.setData({
        results: res[0]
      })
      console.log(res[0])
    })
  },
  clearHis() {
    wx.removeStorage({
      key: '__keyword__',
      success: res => {
        this.setData({
          searchHistory: []
        })
        app.globalData.searchHistory = []
      }
    })
  },

  onShow() {
    wx.getStorage({
      key: '__keyword__',
      success: res => {
        this.setData({
          searchHistory: res.data
        })
      }
    })

  },

  onHide: function () {

  },
})