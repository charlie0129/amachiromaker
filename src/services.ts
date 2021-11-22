import axios from "axios"
import http from "./http"
import { LayerImage } from "./types"

const getDefaultCombination = () => {
    return http.get<LayerImage[]>('defaultCombination.json')
}


export default {
    getDefaultCombination
}