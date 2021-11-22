import axios from "axios"
import http from "./http"
import { Layer, LayerImage } from "./types"

const getDefaultCombination = () => {
    return http.get<LayerImage[]>('defaultCombination.json')
}

const getOrderedLayers = () => {
    return http.get<Layer[]>('orderedLayers.json')
}

export default {
    getDefaultCombination,
    getOrderedLayers,
}