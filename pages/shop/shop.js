const app = getApp()
import { normalURL } from "../../utils/common"
import { getRestaurantDetail, getRestaurantMenu, getRestaurantScore, getRatingCategories, getRatings } from "../../utils/api"
Page({
  data: {
    shopId: '',
    goods: [],
    shop: '',
    currentMenuIndex: 0,
    currentSwiper: 0,

    specFoodsCount: 0,
    selectedFoods: [],
    totalCount: 0,
    totalPrice: 0,
    payDesc: '',
    wHeigth: 0,
    wWidth: 0,

    selectedSpecFoods: [],
    flag: false,
    selectedSpecIndex: 0,
    specPrice: 0,

    cartFlag: false,

    ratingScore: '',
    ratingCate: [],
    ratings: [],
    limit: 20,
    offset: 0,
    type: 4,
    hasMore: true,

    heightArr: [],
    currentIndex: 0
  },
  getAllRects(e) {
    wx.createSelectorQuery().selectAll('.goods-item').boundingClientRect((rects) => {
      rects.forEach((rect) => {
        rect.height  // 节点的高度
      })
    }).exec(res => {
      let arr = [0]
      let hei = 0
      res[0].forEach(item => {
        hei += item.height
        arr.push(hei)
      })
      this.setData({
        heightArr: arr
      })
      console.log(arr)
    })
    
  },
  onGoodScroll(e) {
    
    let heightArr = this.data.heightArr;
    let scrollY = e.detail.scrollTop;
    console.log(heightArr)
    for (let i = 0; i < heightArr.length; i++) {
      let height1 = heightArr[i];
      let height2 = heightArr[i + 1];
      if (!height2 || (scrollY >= height1 && scrollY < height2)) {
        this.setData({
          currentIndex: i
        })
        //console.log(i)
      }
    }

    
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      shopId: options.id
    })
    wx.setNavigationBarTitle({
      title: ''
    })
    this.shopId = options.id
    this._getRestaurantDetail(options.id, app.globalData.address.latitude, app.globalData.address.longitude)
    this._getRestaurantScore(options.id, app.globalData.address.latitude, app.globalData.address.longitude)
    this._getRatingCategories(options.id)
    this.loadMoreRatings()
  },
  _getRestaurantDetail(id, latitude, longitude) {
    getRestaurantDetail(id, latitude, longitude, res => {
      console.log(res)
      res.image_path = normalURL(res.image_path)
      this.setData({
        shop: res,
        payDesc: `￥${res.float_minimum_order_amount}元起送`
      })
      getRestaurantMenu(id, resp => {
        console.log(resp)
        resp.forEach(item => {
          if (item.icon_url) {
            item.icon_url = normalURL(item.icon_url)
          }
          item.foods.forEach(food => {
            food.image_path = normalURL(food.image_path)
          })
        })
        this.setData({
          goods: resp
        })
      })
    })
  },
  menuTap(e) {
    this.setData({
      currentMenuIndex: e.currentTarget.dataset.index
    })
  },
  swiperChange(e) {
    console.log(e)
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  _getRestaurantScore(id, latitude, longitude) {
    getRestaurantScore(id, latitude, longitude, res => {
      for (let k in res) {
        if (res[k] < 10) {
          res[k] = res[k].toFixed(2)
        }
      }
      this.setData({
        ratingScore: res
      })
      console.log(res)
    })
  },
  _getRatingCategories(id) {
    getRatingCategories(id, res => {
      console.log(res)
      this.setData({
        ratingCate: res
      })
    })
  },
  loadMoreRatings() {
    console.log(this.data.hasMore)
    let ratings = this.data.ratings
    if (this.data.hasMore) {
      getRatings(this.shopId, this.data.limit, this.data.offset, 4, res => {
        this.normalImg(res)
        ratings = ratings.concat(res)
        this.setData({
          ratings: ratings
        })
        if (res.length < this.data.limit) {
          this.setData({
            hasMore: false
          })
        } else {
          this.data.offset += this.data.limit
          this.setData({
            hasMore: true
          })
        }
        console.log(res)
      })
    }
  },
  normalImg(list) {
    list.forEach(item => {
      item.item_rating_list.forEach(subItem => {
        subItem.image_hash = subItem.image_hash ? normalURL(subItem.image_hash) : ""
      })
      item.avatar = item.avatar == "" ? 'https://faas.elemecdn.com/desktop/media/img/default-avatar.38e40d.png' : normalURL(item.avatar)
    })
    //console.log(list)
  },

  decreaseCart(e) {
    const index = e.currentTarget.dataset.index;
    const i = e.currentTarget.dataset.i;
    let goods = this.data.goods;
    let selectedFoods = this.data.selectedFoods;
    if (goods[index].foods[i].specfoods.length > 1) {
      wx.showToast({
        title: '多规格商品请从购物车中删除',
        icon: 'success',
        duration: 2000
      })
      return
    }
    if (goods[index].foods[i].specfoods[0].count) {
      goods[index].foods[i].specfoods[0].count--
    }
    //记录当前商品的位置
    goods[index].foods[i].specfoods[0].goodindex = index
    goods[index].foods[i].specfoods[0].foodindex = i
    goods[index].foods[i].specfoods[0].specindex = 0

    this.setData({
      goods: goods,
      selectedFoods: this.foods()
    });
    this.getTotalCount()
    this.getTotalPrice();
    this.setData({
      payDesc: this.payDesc()
    });
    //console.log(this.data.goods)
    console.log(this.data.selectedFoods)
  },
  addCart(e) {
    const index = e.currentTarget.dataset.index;
    const i = e.currentTarget.dataset.i;
    const itemId = e.currentTarget.dataset.id;
    let goods = this.data.goods;
    let selectedFoods = this.data.selectedFoods;

    if (goods[index].foods[i].specfoods[0].count) {
      goods[index].foods[i].specfoods[0].count++
    } else {
      goods[index].foods[i].specfoods[0].count = 1
    }
    goods[index].foods[i].specfoods[0].goodindex = index
    goods[index].foods[i].specfoods[0].foodindex = i
    goods[index].foods[i].specfoods[0].specindex = 0

    this.setData({
      goods: goods,
      selectedFoods: this.foods()
    });
    this.getTotalCount()
    this.getTotalPrice();
    this.setData({
      payDesc: this.payDesc()
    });

    //console.log(this.data.goods)
    console.log(this.data.selectedFoods)
  },
  foods() {
    let foods = []
    this.data.goods.forEach((good) => {
      good.foods.forEach((food) => {
        if (food.specfoods.length > 1) {
          food.specfoods.forEach((specfood) => {
            if (specfood.count && specfood.count > 0) {
              foods.push(specfood);
            }
          })
        } else {
          if (food.specfoods[0].count) {
            foods.push(food.specfoods[0]);
          }
        }
      })
    })
    return foods
  },
  getTotalCount() {
    let count = 0;
    this.data.selectedFoods.forEach((food) => {
      count += food.count;
    });
    this.setData({
      totalCount: count
    });
  },
  getTotalPrice() {
    let total = 0;
    this.data.selectedFoods.forEach(food => {
      total += food.count * food.price;
    })

    this.setData({
      totalPrice: total.toFixed(2)
    });
  },
  payDesc() {
    if (this.data.totalPrice === 0) {
      if (this.data.shop.float_minimum_order_amount || this.data.shop.float_minimum_order_amount == 0) {
        return `￥${this.data.shop.float_minimum_order_amount}元起送`;
      }
    } else if (this.data.totalPrice < this.data.shop.float_minimum_order_amount) {
      let diff = (this.data.shop.float_minimum_order_amount - this.data.totalPrice).toFixed(2);
      return `还差￥${diff}元起送`;
    } else {
      return '去结算';
    }
  },
  showAttr(e) {
    const index = e.currentTarget.dataset.index;
    const i = e.currentTarget.dataset.i;
    this.specIndex = index
    this.specI = i
    this.setData({
      selectedSpecIndex: 0,
      selectedSpecFoods: this.data.goods[index].foods[i].specfoods,
      specPrice: this.data.goods[index].foods[i].specfoods[0].price,
      flag: true
    });
    console.log(this.data.selectedSpecFoods)
  },
  selectSpec(e) {
    const index = e.currentTarget.dataset.index;
    const sold_out = e.currentTarget.dataset.soldout;
    console.log(index)
    if (sold_out) {//售罄了
      return
    }
    this.setData({
      selectedSpecIndex: index,
      specPrice: this.data.selectedSpecFoods[index].price
    })
  },
  addSpec(e) {
    console.log(this.specIndex, this.specI)
    const index = e.currentTarget.dataset.index;
    let goods = this.data.goods;
    let selectedFoods = this.data.selectedFoods;
    let selectedSpecFoods = this.data.selectedSpecFoods

    if (goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].count) {
      goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].count++
    } else {
      goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].count = 1
    }
    let count = 0;
    goods[this.specIndex].foods[this.specI].specfoods.forEach((item) => {
      if (item.count) {
        count += item.count
      }
    })
    goods[this.specIndex].foods[this.specI].count = count
    goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].goodindex = this.specIndex
    goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].foodindex = this.specI
    goods[this.specIndex].foods[this.specI].specfoods[this.data.selectedSpecIndex].specindex = this.data.selectedSpecIndex

    this.setData({
      goods: goods,
      selectedFoods: this.foods()
    });
    this.getTotalCount()
    this.getTotalPrice();
    this.setData({
      payDesc: this.payDesc()
    });
    console.log(this.data.selectedFoods)
    this.hide()
  },
  hide() {
    this.setData({
      flag: false
    });
  },

  toggleCartFoods() {
    let flag = !this.data.cartFlag
    this.setData({
      cartFlag: flag
    });
    console.log(this.data.cartFlag)
  },
  add(e) {
    console.log(e.currentTarget.dataset.specindex)
    const index = e.currentTarget.dataset.index;
    const goodIdx = e.currentTarget.dataset.goodindex;
    const foodIdx = e.currentTarget.dataset.foodindex;
    const specIdx = e.currentTarget.dataset.specindex;
    let goods = this.data.goods;
    let selectedFoods = this.data.selectedFoods


    if (goods[goodIdx].foods[foodIdx].specfoods[specIdx].count) {
      goods[goodIdx].foods[foodIdx].specfoods[specIdx].count++
    } else {
      goods[goodIdx].foods[foodIdx].specfoods[specIdx].count = 1
    }
    let count = 0;
    goods[goodIdx].foods[foodIdx].specfoods.forEach((item) => {
      if (item.count) {
        count += item.count
      }
    })
    goods[goodIdx].foods[foodIdx].count = count

    this.setData({
      goods: goods,
      selectedFoods: this.foods()
    });
    this.getTotalCount()
    this.getTotalPrice();
    this.setData({
      payDesc: this.payDesc()
    });
    console.log(this.data.goods)
    console.log(this.data.selectedFoods)
  },
  decrease(e) {
    const index = e.currentTarget.dataset.index;
    const goodIdx = e.currentTarget.dataset.goodindex;
    const foodIdx = e.currentTarget.dataset.foodindex;
    const specIdx = e.currentTarget.dataset.specindex;
    let goods = this.data.goods;
    let selectedFoods = this.data.selectedFoods

    //selectedFoods[index].count--;

    goods[goodIdx].foods[foodIdx].specfoods[specIdx].count--

    let count = 0;
    goods[goodIdx].foods[foodIdx].specfoods.forEach((item) => {
      if (item.count) {
        count += item.count
      }
    })
    goods[goodIdx].foods[foodIdx].count = count

    this.setData({
      goods: goods,
      selectedFoods: this.foods()
    });
    this.getTotalCount()
    this.getTotalPrice();
    this.setData({
      payDesc: this.payDesc()
    });
    console.log(specIdx, this.data.goods)
    console.log(this.data.selectedFoods)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          wHeight: res.windowHeight
        })
      }
    })

  },
})