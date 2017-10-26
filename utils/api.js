//获取当前城市
export function guess(callBack) {
  const url = 'https://mainsite-restapi.ele.me/shopping/v1/cities/guess'
  wx.request({
    url,
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取天气
export function getWeather(latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/bgs/weather/current'
  wx.request({
    url,
    data: {
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取当前位置
export function getGeo(latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/bgs/poi/reverse_geo_coding'
  wx.request({
    url,
    data: {
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//搜索附近地址
export function getNearby(geohash, keyword, limit, callBack) {
  const url = 'https://restapi.ele.me/v2/pois'
  wx.request({
    url,
    data: {
      'extras[]': 'count',
      geohash,
      keyword,
      limit,
      type: 'nearby'
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取热门搜索
export function getHotSearchWords(latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/shopping/v3/hot_search_words'
  wx.request({
    url,
    data: {
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取首页分类
export function getEntries(latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/shopping/v2/entries'
  wx.request({
    url,
    data: {
      "templates[]": "main_template",
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取推荐商家
export function getShops(latitude, longitude, limit, offset, callBack) {
  const url = 'https://restapi.ele.me/shopping/restaurants'
  wx.request({
    url,
    data: {
      latitude,
      longitude,
      limit,
      offset,
      "extras[]": "activities",
      "terminal": "h5"
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//搜索商家商品
export function searchRestaurants(latitude, longitude, keyword, offset, limit, callBack, restaurant_category_ids = '', order_by = '', obj = { average_cost_ids: '', activity_types: '', delivery_mode: '', support_ids: [] }) {
  const url = 'https://restapi.ele.me/shopping/v1/restaurants/search'
  let supportStr = ''
  if (obj.support_ids.length > 0) {
    obj.support_ids.forEach(id => {
      supportStr += '&support_ids[]=' + id;
    });
  }
  wx.request({
    url,
    data: {
      latitude,
      longitude,
      keyword,
      offset,
      limit,
      'restaurant_category_ids[]': restaurant_category_ids,
      order_by,
      'average_cost_ids[]': obj.average_cost_ids,
      'activity_types[]': obj.activity_types,
      'delivery_mode[]': obj.delivery_mode + supportStr,
      'extras[]': 'activities'
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//商家详情
export function getRestaurantDetail(id, latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/shopping/restaurant/' + id + '?extras[]=activities&extras[]=albums&extras[]=license&extras[]=identification&extras[]=qualification&terminal=h5'
  wx.request({
    url,
    data: {
      'extras[]': 'activities',
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取商家商品
export function getRestaurantMenu(id, callBack) {
  const url = 'https://restapi.ele.me/shopping/v2/menu'
  wx.request({
    url,
    data: {
      restaurant_id: id
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取商家分数
export function getRestaurantScore(id, latitude, longitude, callBack) {
  const url = 'https://www.ele.me/restapi/ugc/v1/restaurants/' + id + '/rating_scores'
  wx.request({
    url,
    data: {
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取评论分类
export function getRatingCategories(id, callBack) {
  const url = 'https://mainsite-restapi.ele.me/ugc/v2/restaurants/' + id + '/ratings/tags'
  wx.request({
    url,
    success: (res) => {
      callBack(res.data)
    }
  })
}

//获取评论内容
export function getRatings(id, limit, offset, record_type, callBack) {
  const url = 'https://restapi.ele.me/ugc/v1/restaurant/' + id + '/ratings'
  wx.request({
    url,
    data: {
      limit,
      offset,
      record_type
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}

//商家分类
export function getCategory(latitude, longitude, callBack) {
  const url = 'https://restapi.ele.me/shopping/v2/restaurant/category'
  wx.request({
    url,
    data: {
      latitude,
      longitude
    },
    success: (res) => {
      callBack(res.data)
    }
  })
}