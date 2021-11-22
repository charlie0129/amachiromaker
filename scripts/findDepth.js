// Order layers (pList) by depth

const orderLayersByDepth = (pList, lyrList) => {
    const orderedPList = []
    
    for (let i = 1; i <= pList.length; i++) {
        const keys = Object.keys(lyrList)
        const values = Object.values(lyrList)
    
        const lyrId = keys[values.findIndex(j => j === i)]
    
        const lyr = pList.find((j) => (
            j.lyrs[0] == lyrId
        ))
    
        orderedPList.push(lyr)
    }

    return orderedPList
}

module.exports = orderLayersByDepth