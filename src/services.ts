import http from "./http"
import { Layer, LayerImage } from "./types"

const getDefaultCombination = () => {
  return http.get<LayerImage[]>('defaultCombination.json')
}

const getOrderedLayers = () => {
  return http.get<Layer[]>('orderedLayers.json')
}

// eslint-disable-next-line
export default {
  getDefaultCombination,
  getOrderedLayers,
}