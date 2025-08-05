// Generate Makefile to download all the assets form cdn.picrew.me
// you may use `make -j12`, where 12 is the number of parallel downloads
// to speed up downloads

const fs = require('fs');
const path = require('path')

const cdnPrefix = "cdn.picrew.me/app/image_maker/"

const cfList = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "cfList.json"), {
  encoding: "utf8",
  flag: "r"
}))

const imgList = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "imgList.json"), {
  encoding: "utf8",
  flag: "r"
}))

let mkContent = "IMG_LIST := "

imgList.forEach(imgPath => {
  mkContent += `${cdnPrefix}${imgPath} `
})

cfList.forEach(imgPath => {
  mkContent += `${cdnPrefix}${imgPath} `
})

mkContent += `

.PHONY: all
all: $(addprefix public/,$(IMG_LIST)) public/orderedLayers.json public/defaultCombination.json

public/${cdnPrefix}%:
\t@echo "Downloading $*" && curl --remove-on-error --create-dirs --silent --show-error -L ${cdnPrefix}$* --output public/${cdnPrefix}$*

public/orderedLayers.json:
\tnode scripts/organizeData.js

public/defaultCombination.json: public/orderedLayers.json
\tnode scripts/findDefaultCombination.js
`

fs.writeFileSync(path.join(__dirname, "..", "Makefile"), mkContent, { encoding: 'utf8', flag: 'w' })

console.log("Generated Makefile! Use make to start downloading (you may use something like -j8 to enable parallel downloads)")
