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
  const [reset, setReset] = useState<boolean>(false)

  useEffect(() => {
    const savedComb = JSON.parse(localStorage.getItem("layerComb") || "null")

    if (!savedComb) {
      services.getDefaultCombination()
        .then(res => {
          setLayerComb(res)
        })
    } else {
      setLayerComb(savedComb)
    }

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
  const handleChangeItem = (layerIdx: number,
    itmId: number | undefined,
    cId: number | undefined,
    url: string | undefined
  ) => {
    const layerComb_ = JSON.parse(JSON.stringify(layerComb)) as LayerImage[]
    layerComb_[layerIdx] = {
      ...layerComb_[layerIdx],
      itmId: itmId as number,
      cId: cId as number,
      url: url as string,
    }

    localStorage.setItem("layerComb", JSON.stringify(layerComb_))

    setLayerComb(layerComb_);
  }

  const handleDownloadImage = () => {
    const layerList = layerComb?.filter(i => i.url)?.map(i => ({
      src: `${consts.CDN_PREFIX}${i.url}`,
      x: i.x,
      y: i.y
    })) || []

    mergeImages(layerList)
      .then(b64 => {
        const image = new Image()
        image.src = b64

        const win = window.open("");
        win?.document.write(image.outerHTML)

        // window.location.href = b64.replace("data:image/png;base64,", "data:application/octet-stream;base64,")
      })
  }

  const handleReset = () => {
    services.getDefaultCombination()
      .then(res => {
        setLayerComb(res)
        localStorage.setItem("layerComb", JSON.stringify(res))
      })
  }

  return (
    <div className="App">
      <div className="left-area">
        <div className="image-area" onClick={handleDownloadImage}>
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
        <button className="button-1" role="button" onClick={handleReset}>Reset</button>
      </div>

      <div className="config-area">
        <Tabs>
          <TabList>
            {
              orderedLayers?.map(i => (
                <Tab><img className="tab-image" src={`${consts.CDN_PREFIX}${i.thumbUrl}`}/></Tab>
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
                      <img
                        className={layerComb?.[idx]?.itmId === 0 ? "item-image-selected" : "item-image"}
                        onClick={() => { handleChangeItem(idx, 0, 0, "") }}
                        src="emptyset.svg"
                      />
                    }
                    {
                      i.items.map(item => (
                        <img
                          className={layerComb?.[idx]?.itmId === item.itmId ? "item-image-selected" : "item-image"}
                          src={`${consts.CDN_PREFIX}${item.thumbUrl}`}
                          onClick={() => {
                            const sameColorItem = item.originals.find(i => i.cId === layerComb?.[idx]?.cId)
                            handleChangeItem(idx, item.itmId, sameColorItem?.cId || item.originals[0].cId, sameColorItem?.url || item.originals[0].url)
                          }}
                        />
                      ))
                    }
                  </div>
                  {
                    !!(Object.keys(i.colors).length > 1 && layerComb?.[idx]?.itmId) && <div className="color-container">
                      {
                        i.items.find(j => j.itmId === layerComb?.[idx]?.itmId)?.originals.map(orig => (
                          <div
                            className={layerComb?.[idx]?.cId === orig.cId ? "color-image-selected" : "color-image"}
                            style={{ background: i.colors[orig.cId] }}
                            onClick={() => { handleChangeItem(idx, layerComb?.[idx]?.itmId as number, orig.cId, orig.url) }}
                          />
                        ))
                      }
                    </div>
                  }


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
