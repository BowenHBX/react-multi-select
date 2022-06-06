---
title: Demo
order: 1
---

本 Demo 演示鼠标拖动多选的用法。

```jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import VideoEditorUiMultiSelect from '@ali/video-editor-ui-multi-select';

import './index.css';

const App = ()=> {
  const [selected, setSelected] = useState([]);
  return (
    <div>
      <div className="container" id="container">
        <div className="item" clip-id="item1" key="item1">item1</div>
        <div className="item" clip-id="item2" key="item2">item2</div>
        <div className="item" clip-id="item3" key="item3">item3</div>
        <div className="item" clip-id="item4" key="item4">item4</div>
        <VideoEditorUiMultiSelect 
          uniqueKey={'clip-id'}
          container={'#container'}
          targetsClassName="item"
          activeClassName="selected"
          onSelect={((eles) => {
            console.log('xxxx-onSelect', eles);
          })}
          onSelectEnd={((eles) => {
            console.log('xxxx-onSelectEnd', eles);
            let selectedClipIds = [];
            eles.forEach((el) => {
              const clipId = el.getAttribute('clip-id');
              if (clipId) {
                selectedClipIds.push(clipId);
              }
            });
            setSelected(selectedClipIds);
          })}
        />
      </div>
      <p>选中项：{selected.join(',')}</p>
    </div>
  );
}

ReactDOM.render((
  <App />
), mountNode);
```
