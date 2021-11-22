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
    const defaultItem = layer.items.find(i => i.itmId === layer.defItmId);

    defaultCombination.push({
        url: defaultItem?.originals?.[0]?.url || "",
        x: layer.x,
        y: layer.y,
        itmId: layer.defItmId,
        cId: defaultItem?.originals?.[0]?.cId || 0
    })
})

fs.writeFileSync('defaultCombination.json', JSON.stringify(defaultCombination, null, 2), { encoding: 'utf8', flag: 'w' })