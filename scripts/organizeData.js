// organize original layer data to a more readable format

const fs = require('fs');
const path = require('path')
const orderLayersByDepth = require("./findDepth")

const cf = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "cf.json"), {
    encoding: "utf8",
    flag: "r"
}))

const img = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "img.json"), {
    encoding: "utf8",
    flag: "r"
}))

const pList = cf.pList
const cpList = cf.cpList
const imgLst = img.lst

pList.forEach(layer => {
    // copy colors
    layer.colors = {}
    cpList[layer.cpId].forEach(color => {
        Object.assign(layer.colors, {[color.cId]: color.cd})
    })
    // layer.colors = cpList[layer.cpId]
    
    // console.log("colors", layer.colors)
    // console.log("pId", layer.pId)
    // console.log("cpId", layer.cpId)
    // console.log("lyId", layer.lyrs[0])

    layer.items.forEach(item => {
        const originals = []
        // console.log("itemId",item.itmId)
        Object.keys(layer.colors).forEach(cId => {
            // console.log("cId",cId)

            if(imgLst?.[item.itmId]?.[layer.lyrs[0]]?.[cId]?.url) {
                originals.push({
                    cId: Number(cId),
                    url: imgLst[item.itmId][layer.lyrs[0]][cId].url
                })
            }
        })
        
        item.originals = originals
    })
})

const orderedPList = orderLayersByDepth(pList, cf.lyrList)

fs.writeFileSync(path.join(__dirname, "..", "public", "orderedLayers.json"), JSON.stringify(orderedPList), { encoding: 'utf8', flag: 'w' })