import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import logo from './logo.svg';
import './App.css';
import { Layer, LayerImage } from './types';
import services from './services';
import consts from './consts';

import 'react-tabs/style/react-tabs.css';
import mergeImages from 'merge-images';


function App() {
  const [layerComb, setLayerComb] = useState<LayerImage[]>();
  const [orderedLayers, setOrderedLayers] = useState<Layer[]>();

  useEffect(() => {
    services.getDefaultCombination()
      .then(res => {
        setLayerComb(res)
      })
    services.getOrderedLayers()
      .then(res => {
        setOrderedLayers(res)
      })
  }, [])



  //   export interface LayerImage {
  //     url: string;
  //     x: number;
  //     y: number;
  //     itmId: number;
  //     cId: number;
  //   }
  const handleChangeItem = (layerIdx: number, itmId: number, cId: number, url: string) => {
    const layerComb_ = JSON.parse(JSON.stringify(layerComb)) as LayerImage[]
    layerComb_[layerIdx] = {
      ...layerComb_[layerIdx],
      itmId,
      cId,
      url,
    }
    setLayerComb(layerComb_);
  }

  const handleDownloadImage = () => {
    const layerList = layerComb?.filter(i => i.url)?.map(i => ({
      src: `${consts.CDN_PREFIX}${i.url}`,
      x: i.x,
      y: i.y
    })) || []

    console.log(layerList)

    mergeImages(layerList)
      .then(b64 => {
        const image = new Image()
        image.src = b64

        const win = window.open("");
        win?.document.write(image.outerHTML)

        // window.location.href = b64.replace("data:image/png;base64,", "data:application/octet-stream;base64,")
      })
  }

  return (
    <div className="App">
      <div className="image-area" style={{ border: "dashed grey" }} onClick={handleDownloadImage}>
        {
          layerComb?.map((layer, idx) => (
            layer.url && <img
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
        <Tabs>
          <TabList>
            {
              orderedLayers?.map(i => (
                <Tab>{i.pNm}</Tab>
              ))
            }
          </TabList>
          {
            orderedLayers?.map((i, idx) => (
              <TabPanel>
                <div className="tab-content">
                  <div className="item-container">
                    {
                      !!i.isRmv &&
                      <span
                        className={layerComb?.[idx]?.itmId === 0 ? "item-image-selected" : "item-image"}
                        onClick={() => { handleChangeItem(idx, 0, 0, "") }}
                      >
                        None
                      </span>
                    }
                    {
                      i.items.map(item => (
                        <img
                          className={layerComb?.[idx]?.itmId === item.itmId ? "item-image-selected" : "item-image"}
                          src={`${consts.CDN_PREFIX}${item.thumbUrl}`}
                          onClick={() => { handleChangeItem(idx, item.itmId, 0, item.originals[0].url) }}
                        />
                      ))
                    }
                  </div>

                </div>


              </TabPanel>
            ))
          }

          <TabPanel>
            <h2>Any content 2</h2>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
