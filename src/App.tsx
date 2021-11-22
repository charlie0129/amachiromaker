import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { LayerImage } from './types';
import services from './services';
import consts from './consts';


function App() {
  const [layerComb, setLayerComb] = useState<LayerImage[]>();

  useEffect(() => {
    services.getDefaultCombination()
      .then(res => {
        setLayerComb(res)
      })
  }, [])

  return (
    <div className="App">
      <div className="image-area" style={{ border: "dashed red" }}>
        {
          layerComb?.map((layer, idx) => (
            <img
              src={`${consts.CDN_PREFIX}${layer.url}`}
              className="layer-image"
              style={{
                left: layer.x,
                top: layer.y,
                zIndex: 500 + idx
              }}
            />
          ))
        }
      </div>
      <div className="config-area" style={{ border: "dashed blue" }}>

      </div>
    </div>
  );
}

export default App;
