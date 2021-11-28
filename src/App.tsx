import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import mergeImages from 'merge-images';
import { Psd } from 'ag-psd';
import { saveAs } from 'file-saver';
import useWindowDimensions from './hooks';
import { Layer, LayerImage } from './types';
import services from './services';
import consts from './consts';

import './App.css';
import 'react-tabs/style/react-tabs.css';

function App() {
  const [layerComb, setLayerComb] = useState<LayerImage[]>();
  const [orderedLayers, setOrderedLayers] = useState<Layer[]>();
  const [outputImage, setOutputImage] = useState<string>();
  const [psdContent, setPsdContent] = useState<Blob>()
  const { width, height } = useWindowDimensions();

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

  const handleReset = () => {
    services.getDefaultCombination()
      .then(res => {
        setLayerComb(res)
        localStorage.setItem("layerComb", JSON.stringify(res))
      })
  }

  useEffect(() => {
    const layerList = layerComb?.filter(i => i.url)?.map(i => ({
      src: `${consts.CDN_PREFIX}${i.url}`,
      x: i.x,
      y: i.y
    })) || []

    mergeImages(layerList)
      .then(b64 => {
        setOutputImage(b64)
      })
  }, [layerComb])

  const handleDownloadPsd = async () => {
    const agPsd = await import('ag-psd');

    const psdLayers = await Promise.all(
      (layerComb || []).map((i, idx) => ({
        ...i,
        name: orderedLayers?.[idx].pNm
      })).filter(i => i.url).map(async (layer, idx) => {
        const drawImg = (ctx: any, url: string) => {

          return new Promise(resolve => {
            const image = new Image();
            image.onload = function () {
              ctx.drawImage(image, 0, 0);
              resolve('resolved');
            };
            image.src = `${consts.CDN_PREFIX}${url}`;
          });
        }

        const canvas2 = new OffscreenCanvas(600, 600);
        await drawImg(canvas2.getContext('2d'), layer.url)

        return {
          top: layer.y,
          left: layer.x,
          blendMode: 'normal',
          opacity: 1,
          name: layer.name,
          canvas: canvas2
        }
      }))

    const psdData: Psd = {
      width: 600,
      height: 600,
      colorMode: 3,
      channels: 3,
      bitsPerChannel: 8,
      children: psdLayers as any
    }

    console.log('start write')
    const data = agPsd.writePsd(psdData);
    const blob = new Blob([data]);
    saveAs(blob, 'output.psd')
  }

  return (
    <div className="App" style={{ flexDirection: width > height ? "row" : "column" }}>
      <div className="left-area">
        {
          outputImage?.startsWith("data:image/png;base64,") ? (
            <img className="layer-image" src={outputImage} title="Output Image (click to download)" alt="" />
          ) : (
            <div className="loading-text-container">loading...</div>
          )
        }
        {
          outputImage?.startsWith("data:image/png;base64,") &&
          <div className="button-group">
            <button className="button-1" onClick={handleReset}>Reset</button>
            <button className="button-2" onClick={() => { saveAs(outputImage || "", 'output.png') }}>Save PNG</button>
            <button className="button-2" onClick={handleDownloadPsd}>Save PSD</button>
          </div>
        }
      </div>

      <div className="config-area">
        <Tabs>
          <TabList>
            {
              orderedLayers?.map(i => (
                <Tab><img className="tab-image" src={`${consts.CDN_PREFIX}${i.thumbUrl}`} alt="" /></Tab>
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
                        alt=""
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
                          alt=""
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
        </Tabs>
      </div>
    </div>
  );
}

export default App;
