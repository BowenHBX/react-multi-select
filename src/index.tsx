import * as React from "react";
import { useEffect, useRef } from "react";

import './index.global.scss';
interface IProps {
  /**
   * 用于显示选中框的容器id或者class，需要有position: relative|absolute;设置
   * 使用方法：container="#container" || container=".container"
   */
  container: string;
  /**
   * 可被选中项的class
   */
  targetsClassName: string;
  /**
   * 已选中状态class
   */
  activeClassName: string;
  /**
   * 唯一值，用于选中性能
   */
  uniqueKey: string;
  /**
   * 选中开始回调
   */
  onSelectStart?: () => any;
  /**
   * 选择中回调
   */
  onSelect?: (e: any) => any;
  /**
   * 选择结束回调
   */
  onSelectEnd?: (e: Element[]) => any;
}
const MultiSelect = (props: IProps) => {
  const {
    container, targetsClassName, activeClassName = 'active', uniqueKey,
    onSelectStart, onSelect, onSelectEnd
  } = props;
  // 用于判断多选框选中状态
  const hasSelectedRef = useRef<boolean>(false);
  // 用于记录选中项
  const selectedEleRef = useRef<Element[]>([]);
  // 用于记录选中key
  const selectedKeysRef = useRef<string[]>([]);

  useEffect(() => {
    if (container) {
      // console.log('xxxx-containerId', container);
      multiSelect();
    }
  }, [container]);

  const getAllSelectedRect = () => {
    const moveSelected = document.getElementById('move-selected');
    if (moveSelected) {
      const rect = moveSelected.getBoundingClientRect();
      const { top, left, bottom, right } = rect;
      const allClips = document.getElementsByClassName(targetsClassName);
      let len = allClips?.length ?? 0;
      const selectedClip: Element[] = [];
      const unSelectedClip: Element[] = [];
      const selectedClipIds: string[] = [];
      for (let i = 0; i < len; i++) {
        const clipDiv = allClips[i];
        const rect = clipDiv.getBoundingClientRect();
        const { top: clipTop, left: clipLeft, bottom: clipBottom, right: clipRight } = rect;
        if (!(clipLeft > right || clipBottom < top || clipTop > bottom || clipRight < left)) {
          selectedClip.push(clipDiv);

          const clipId = clipDiv.getAttribute(uniqueKey);
          clipId && selectedClipIds.push(clipId);
        } else {
          unSelectedClip.push(clipDiv);
        }
      }
      if (selectedClipIds.join('') !== selectedKeysRef.current.join('')) {
        unSelectedClip.forEach(ele => {
          ele.classList.remove(activeClassName);
        });
        selectedEleRef.current = selectedClip;
        selectedEleRef.current.forEach(ele => {
          ele.classList.add(activeClassName);
        });
        selectedKeysRef.current = selectedClipIds;
        onSelect && onSelect(selectedEleRef.current);
      }
    }
  }

  /**
   * 判断落点是否在target上
   * @returns
   */
  const inTargetRect = (event: MouseEvent) => {
    const { pageY, pageX } = event;
    const allClips = document.getElementsByClassName(targetsClassName);
    let len = allClips?.length ?? 0;
    let result = false;
    for (let i = 0; i < len; i++) {
      const clipDiv = allClips[i];
      const rect = clipDiv.getBoundingClientRect();
      const { top, left, bottom, right } = rect;
      if (pageY >= top && pageY <= bottom && pageX >= left && pageX <= right) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * 判断落点是否在container里面
   * @param event
   * @returns
   */
  const inContainerRect = (event: any) => {
    const { pageY, pageX } = event;
    if (container) {
      const dom = container.indexOf('#') === 0 ? document.getElementById(pureClassOrId(container)) : document.getElementsByClassName(pureClassOrId(container))[0];
      if (dom) {
        const { top, left, bottom, right } = dom?.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
        return pageY >= top + scrollTop && pageY <= bottom + scrollTop && pageX >= left && pageX <= right;
      }
    }
    return false;
  }

  const pureClassOrId = (classOrId: string) => {
    return classOrId.replace('#', '').replace('.', '');
  }

  /**
   * 实现rect多选
   */
  const multiSelect = () => {
    let oldLeft = 0;
    let oldTop = 0;
    const timelineContainerSection = document.body;
    const moveSelected = document.getElementById('move-selected');

    timelineContainerSection?.addEventListener('mousedown', (event: any) => {
      // console.log('xxxx-mousedown', event);
      if (!inContainerRect(event)) { return; }
      if (inTargetRect(event)) { return; }
      if (!moveSelected) { return };
      clearDragData();
      selectedEleRef.current.forEach(ele => {
        ele.classList.remove(activeClassName);
      });
      selectedEleRef.current = [];
      // 判断鼠标是否在clip区域内
      hasSelectedRef.current = true;
      const dom = container.indexOf('#') === 0 ? document.getElementById(pureClassOrId(container)) : document.getElementsByClassName(pureClassOrId(container))[0];
      if (dom) {
        const rect = dom?.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
        const { top = 0, left = 0 } = rect;
        // console.log('xxxx-mousedown', event.pageY, top, scrollTop);
        oldLeft = event.pageX - left;
        oldTop = event.pageY - top - scrollTop;
        if (moveSelected) {
          moveSelected.style.top = oldTop + 'px';
          moveSelected.style.left = oldLeft + 'px';
        }
      }
      event.stopPropagation();
      onSelectStart && onSelectStart();
    });

    timelineContainerSection?.addEventListener('mousemove', (event: any) => {
      if (!hasSelectedRef.current) { return }; //只有开启了拖拽，才进行mouseover操作
      if (!moveSelected) { return };
      // console.log('xxxx-mousemove', event);
      const dom = container.indexOf('#') === 0 ? document.getElementById(pureClassOrId(container)) : document.getElementsByClassName(pureClassOrId(container))[0];
      if (dom) {
        const { top: containerTop, left: containerLeft, width: cWidth, height: cHeight } = dom?.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
        const tmpTop = event.pageY - containerTop - scrollTop;
        const tmpLeft = event.pageX - containerLeft;
        let top = +moveSelected.style.top?.replace('px', '') || 0;
        let left = +moveSelected.style.left?.replace('px', '') || 0;
        let height = +moveSelected.style.height?.replace('px', '') || 0;
        let width = +moveSelected.style.width?.replace('px', '') || 0;
        if (tmpLeft < oldLeft) {
          //向左拖
          left = tmpLeft;
          width = oldLeft - tmpLeft;
          if (left < 0) {
            left = 0;
            width = oldLeft;
          }
          moveSelected.style.left = `${left}px`;
          moveSelected.style.width = `${width}px`;
        } else {
          // 向右拖
          width = tmpLeft - oldLeft;
          if (oldLeft + width > cWidth) {
            width = cWidth - oldLeft;
          }
          moveSelected.style.width = `${width}px`;
        }
        if (tmpTop < oldTop) {
          //向上
          top = tmpTop;
          height = oldTop - tmpTop;
          if (top < 0) {
            top = 0;
            height = oldTop;
          }
          moveSelected.style.top = `${top}px`;
          moveSelected.style.height = `${height}px`;
        } else {
          // 向下
          height = tmpTop - oldTop;
          if (oldTop + height > cHeight) {
            height = cHeight - oldTop;
          }
          moveSelected.style.height = `${height}px`;
        }
      }
      event.preventDefault();
      event.stopPropagation();
      getAllSelectedRect();
    });

    timelineContainerSection?.addEventListener('mouseup', (event: any) => {
      if (!hasSelectedRef.current) { return };
      if (!moveSelected) { return };
      // console.log('xxxx-mousemove', event);
      hasSelectedRef.current = false;
      clearDragData();
      event.preventDefault();
      event.stopPropagation();
      // 返回所有选中的目标
      onSelectEnd && onSelectEnd(selectedEleRef.current);
    });
  };

  // 重置数据
  const clearDragData = () => {
    const moveSelected = document.getElementById('move-selected');
    if (moveSelected) {
      moveSelected.style.width = '0';
      moveSelected.style.height = '0';
      moveSelected.style.top = '0';
      moveSelected.style.left = '0';
      moveSelected.style.bottom = '0';
      moveSelected.style.right = '0';
    }
  };

  return (
    <div id="move-selected" className="multi-selected" />
  );
}
export default MultiSelect;
