const fs = require('fs');

const orderedLayers = JSON.parse(fs.readFileSync("orderedLayers.json", {
    encoding: "utf8",
    flag: "r"
}))

// export interface LayerImage {
//     url: string;
//     x: number;
//     y: number;
//     itmId: number;
//     cId: number;
// }

const defaultCombination = []

orderedLayers.forEach(layer => {
    defaultCombination.push({
        url: layer.items[0].originals[0].url,
        x: layer.x,
        y: layer.y,
        itmId: layer.items[0].itmId,
        cId: layer.items[0].originals[0].cId
    })
})

fs.writeFileSync('defaultCombination.json', JSON.stringify(defaultCombination, null, 2), { encoding: 'utf8', flag: 'w' })