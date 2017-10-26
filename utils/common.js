import { imageBasePath } from "./config"
export function normalURL(string, size, quality = 85) {
  if (string) {
    let str = string
    let str1 = str.slice(0, 1).concat('/')
    let str2 = str.slice(1, 3).concat('/')
    let str3 = str.slice(3)
    str = str1.concat(str2).concat(str3)
    if (str.slice(str.length - 3) == 'png') {
      str = str.replace('png', 'png.png')
    } else if (str.slice(str.length - 4) == 'jpeg') {
      str = str.replace('jpeg', 'jpeg.jpeg')
    }
    if (size && quality) {
      return imageBasePath + str + '?imageMogr2/thumbnail/' + size + '/format/jpeg/quality/' + quality
    } else {
      return imageBasePath + str
    }
  }
}

export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}