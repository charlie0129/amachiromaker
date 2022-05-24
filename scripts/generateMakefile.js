// Generate Makefile to download all the assets form cdn.picrew.me
// you may use `make -j12`, where 12 is the number of parallel downloads
// to speed up downloads

const fs = require('fs');
const path = require('path')

const cdnPrefix = "http://web.archive.org/web/20210130063021/https://cdn.picrew.me/app/image_maker"

const cfList = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "cfList.json"), {
  encoding: "utf8",
  flag: "r"
}))

const imgList = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "imgList.json"), {
  encoding: "utf8",
  flag: "r"
}))

let mkContent = "all: "

imgList.forEach(imgPath => {
  mkContent += `public/cdn.picrew.me/app/image_maker/${imgPath} `
})

cfList.forEach(imgPath => {
  mkContent += `public/cdn.picrew.me/app/image_maker/${imgPath} `
})

mkContent += "public/orderedLayers.json "
mkContent += "public/defaultCombination.json "

mkContent += "\n\n"

imgList.forEach(imgPath => {
  let mkTarget = ""
  const localImgPath = `public/cdn.picrew.me/app/image_maker/${imgPath}`
  mkTarget += `${localImgPath}: `
  mkTarget += "\n\t"

  const imageDownloadLink = `${cdnPrefix}/${imgPath}`

  const downloadCmd = `@curl --create-dirs --silent --show-error -L ${imageDownloadLink} --output ${localImgPath}`

  mkTarget += downloadCmd

  mkContent += mkTarget + "\n\n"
})

cfList.forEach(imgPath => {
  let mkTarget = ""
  const localImgPath = `public/cdn.picrew.me/app/image_maker/${imgPath}`
  mkTarget += `${localImgPath}: `
  mkTarget += "\n\t"

  const imageDownloadLink = `${cdnPrefix}/${imgPath}`

  const downloadCmd = `@curl --create-dirs --silent --show-error -L ${imageDownloadLink} --output ${localImgPath}`

  mkTarget += downloadCmd

  mkContent += mkTarget + "\n\n"
})

mkContent += "public/orderedLayers.json: \n"
mkContent += "\tnode scripts/organizeData.js\n\n"

mkContent += "public/defaultCombination.json: public/orderedLayers.json\n"
mkContent += "\tnode scripts/findDefaultCombination.js\n\n"

fs.writeFileSync(path.join(__dirname, "..", "Makefile"), mkContent, { encoding: 'utf8', flag: 'w' })

console.log("Generated Makefile! Use make to start downloading (you may use something like -j8 to enable parallel downloads)")
