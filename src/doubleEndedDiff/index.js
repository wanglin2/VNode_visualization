let callbacks = {}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2022-10-26 09:55:20
 * @Desc: 等待函数
 */
let wait = () => {}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-28 14:05:31
 * @Desc: 创建vNode对象
 */
export const h = (tag, data = {}, children) => {
  let text = ''
  let el
  let key
  // 文本节点
  if (typeof children === 'string' || typeof children === 'number') {
    text = children
    children = undefined
  } else if (!Array.isArray(children)) {
    children = undefined
  }
  if (data && data.key) {
    key = data.key
  }
  return {
    tag, // 元素标签
    children, // 子元素
    text, // 文本节点的文本
    el, // 真实dom
    key,
    data
  }
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-28 16:24:56
 * @Desc: vnode->dom
 */
const createEl = vnode => {
  let el = document.createElement(vnode.tag)
  vnode.el = el
  if (vnode.children && vnode.children.length > 0) {
    vnode.children.forEach(item => {
      el.appendChild(createEl(item))
    })
  }
  if (vnode.text) {
    el.appendChild(document.createTextNode(vnode.text))
  }
  return el
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 13:42:55
 * @Desc: 判断是否是同一个节点
 */
const isSameNode = (a, b) => {
  return a.key === b.key && a.tag === b.tag
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 15:12:24
 * @Desc: 在节点列表里寻找同个节点，返回索引
 */
const findSameNode = (list, node) => {
  return list.findIndex(item => {
    return item && isSameNode(item, node)
  })
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 09:28:42
 * @Desc: diff算法
 */
const diff = async (el, oldChildren, newChildren) => {
  // 指针
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  // 节点
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = newChildren[newStartIdx]
  let newEndVNode = newChildren[newEndIdx]
  callbacks.updatePointers(oldStartIdx, oldEndIdx, newStartIdx, newEndIdx)
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    let stop = false
    let _isSameNode = false
    if (oldStartVNode === null) {
      callbacks.updateInfo('')
      oldStartVNode = oldChildren[++oldStartIdx]
      stop = true
    }
    if (!stop && oldEndVNode === null) {
      callbacks.updateInfo('')
      oldEndVNode = oldChildren[--oldEndIdx]
      stop = true
    }
    if (!stop && newStartVNode === null) {
      callbacks.updateInfo('')
      newStartVNode = oldChildren[++newStartIdx]
      stop = true
    }
    if (!stop && newEndVNode === null) {
      callbacks.updateInfo('')
      newEndVNode = oldChildren[--newEndIdx]
      stop = true
    }
    if (!stop) {
      callbacks.updateInfo('头-头比较')
      callbacks.updateCompareNodes(oldStartIdx, newStartIdx)
      _isSameNode = isSameNode(oldStartVNode, newStartVNode)
      if (_isSameNode) {
        callbacks.updateInfo(
          'key值相同，可以复用，进行patch打补丁操作。新旧节点位置相同，不需要移动对应的真实DOM节点'
        )
      }
      await wait()
    }
    if (!stop && _isSameNode) {
      // 头-头
      patchVNode(oldStartVNode, newStartVNode)
      // 更新指针
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
      stop = true
    }
    if (!stop) {
      callbacks.updateInfo('头-尾比较')
      callbacks.updateCompareNodes(oldStartIdx, newEndIdx)
      _isSameNode = isSameNode(oldStartVNode, newEndVNode)
      if (_isSameNode) {
        callbacks.updateInfo(
          'key值相同，可以复用，进行patch打补丁操作。新旧节点位置不同，需要移动对应的真实DOM节点'
        )
      }
      await wait()
    }
    if (!stop && _isSameNode) {
      // 头-尾
      patchVNode(oldStartVNode, newEndVNode)
      // 把oldStartVNode节点移动到最后
      el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
      callbacks.moveNode(oldStartIdx, oldEndIdx + 1)
      // 更新指针
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
      stop = true
    }
    if (!stop) {
      callbacks.updateInfo('尾-头比较')
      callbacks.updateCompareNodes(oldEndIdx, newStartIdx)
      _isSameNode = isSameNode(oldEndVNode, newStartVNode)
      if (_isSameNode) {
        callbacks.updateInfo(
          'key值相同，可以复用，进行patch打补丁操作。新旧节点位置不同，需要移动对应的真实DOM节点'
        )
      }
      await wait()
    }
    if (!stop && _isSameNode) {
      // 尾-头
      patchVNode(oldEndVNode, newStartVNode)
      // 把oldEndVNode节点移动到oldStartVNode前
      el.insertBefore(oldEndVNode.el, oldStartVNode.el)
      callbacks.moveNode(oldEndIdx, oldStartIdx)
      // 更新指针
      oldEndVNode = oldChildren[--oldEndIdx]
      newStartVNode = newChildren[++newStartIdx]
      stop = true
    }
    if (!stop) {
      callbacks.updateInfo('尾-尾比较')
      callbacks.updateCompareNodes(oldEndIdx, newEndIdx)
      _isSameNode = isSameNode(oldEndVNode, newEndVNode)
      if (_isSameNode) {
        callbacks.updateInfo(
          'key值相同，可以复用，进行patch打补丁操作。新旧节点位置相同，不需要移动对应的真实DOM节点'
        )
      }
      await wait()
    }
    if (!stop && _isSameNode) {
      // 尾-尾
      patchVNode(oldEndVNode, newEndVNode)
      // 更新指针
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = newChildren[--newEndIdx]
      stop = true
    }
    callbacks.updateCompareNodes(-1, -1)
    if (!stop) {
      callbacks.updateInfo(
        '头尾比较没有找到可复用节点，直接在旧的VNode列表里搜索是否有可复用节点'
      )
      callbacks.updateCompareNodes(-1, newStartIdx)
      await wait()
      let findIndex = findSameNode(oldChildren, newStartVNode)
      // newStartVNode在旧列表里不存在，那么是新节点，创建插入
      if (findIndex === -1) {
        callbacks.updateInfo('该节点在旧列表里不存在，需要创建DOM节点并插入')
        await wait()
        el.insertBefore(createEl(newStartVNode), oldStartVNode.el)
        callbacks.insertNode(newStartVNode, oldStartIdx)
        await wait()
      } else {
        // 在旧列表里存在，那么进行patch，并且移动到oldStartVNode前
        callbacks.updateInfo(
          '该节点在旧的VNode列表里存在可复用节点，进行path打补丁操作，并且移动对应的真实DOM节点。然后将该VNode置空'
        )
        callbacks.updateCompareNodes(findIndex, newStartIdx)
        await wait()
        callbacks.updateCompareNodes(-1, -1)
        let oldVNode = oldChildren[findIndex]
        patchVNode(oldVNode, newStartVNode)
        el.insertBefore(oldVNode.el, oldStartVNode.el)
        callbacks.moveNode(findIndex, oldStartIdx, true)
        oldChildren[findIndex] = null
        await wait()
      }
      newStartVNode = newChildren[++newStartIdx]
    }
    callbacks.updateCompareNodes(-1, -1)
    callbacks.updateInfo('')
    callbacks.updatePointers(oldStartIdx, oldEndIdx, newStartIdx, newEndIdx)
    await wait()
  }
  // 旧列表里存在新列表里没有的节点，需要删除
  if (oldStartIdx <= oldEndIdx) {
    callbacks.updateInfo(
      '新的VNode列表已比较完毕，开始删除旧的VNode列表里不再需要的节点'
    )
    await wait()
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldChildren[i]) {
        callbacks.updateInfo('该节点在新列表里不存在，需要删除')
        callbacks.updateDeleteNode(i)
        await wait()
        callbacks.updateInfo('')
        callbacks.updateDeleteNode(-1)
        removeEvent(oldChildren[i])
        el.removeChild(oldChildren[i].el)
        callbacks.removeChild(i)
      } else {
        callbacks.updateInfo('空的VNode，跳过')
        callbacks.updateDeleteNode(i)
        await wait()
        callbacks.updateInfo('')
        callbacks.updateDeleteNode(-1)
      }
    }
  } else if (newStartIdx <= newEndIdx) {
    callbacks.updateInfo(
      '旧的VNode列表已比较完毕，开始添加旧的VNode列表里不存在的节点'
    )
    await wait()
    let before = newChildren[newEndIdx + 1]
      ? newChildren[newEndIdx + 1].el
      : null
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      callbacks.updateInfo('该节点在旧列表里不存在，需要添加')
      callbacks.updateAddNode(i)
      await wait()
      callbacks.updateInfo('')
      callbacks.updateAddNode(-1)
      el.insertBefore(createEl(newChildren[i]), before)
      callbacks.insertNode(newChildren[i], before ? newEndIdx + 1 : -1, true)
    }
  }
  callbacks.updateDeleteNode(-1)
  callbacks.updateAddNode(-1)
  callbacks.updateInfo('大功告成')
  callbacks.done()
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 16:58:44
 * @Desc: 更新类名
 */
const updateClass = (el, newVNode) => {
  if (!el) {
    return
  }
  el.className = ''
  if (newVNode.data && newVNode.data.class) {
    let className = ''
    Object.keys(newVNode.data.class).forEach(cla => {
      if (newVNode.data.class[cla]) {
        className += cla + ' '
      }
    })
    el.className = className
  }
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 17:10:21
 * @Desc: 更新样式
 */
const updateStyle = (el, oldVNode, newVNode) => {
  if (!el) {
    return
  }
  let oldStyle = (oldVNode && oldVNode.data.style) || {}
  let newStyle = newVNode.data.style || {}
  // 移除旧节点里存在新节点里不存在的样式
  Object.keys(oldStyle).forEach(item => {
    if (newStyle[item] === undefined || newStyle[item] === '') {
      el.style[item] = ''
    }
  })
  // 添加旧节点不存在的新样式
  Object.keys(newStyle).forEach(item => {
    if (oldStyle[item] !== newStyle[item]) {
      el.style[item] = newStyle[item]
    }
  })
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 17:23:51
 * @Desc: 更新属性
 */
const updateAttr = (el, oldVNode, newVNode) => {
  if (!el) {
    return
  }
  let oldAttr = oldVNode && oldVNode.data.attr ? oldVNode.data.attr : {}
  let newAttr = newVNode.data.attr || {}
  // 移除旧节点里存在新节点里不存在的属性
  Object.keys(oldAttr).forEach(item => {
    if (newAttr[item] === undefined || newAttr[item] === '') {
      el.removeAttribute(item)
    }
  })
  // 添加旧节点不存在的新属性
  Object.keys(newAttr).forEach(item => {
    if (oldAttr[item] !== newAttr[item]) {
      el.setAttribute(item, newAttr[item])
    }
  })
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 17:44:01
 * @Desc: 移除所有事件
 */
const removeEvent = oldVNode => {
  if (oldVNode && oldVNode.data && oldVNode.data.event) {
    Object.keys(oldVNode.data.event).forEach(item => {
      oldVNode.el.removeEventListener(item, oldVNode.data.event[item])
    })
  }
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-29 17:41:37
 * @Desc: 更新事件
 */
const updateEvent = (el, oldVNode, newVNode) => {
  if (!el) {
    return
  }
  let oldEvent = oldVNode && oldVNode.data.event ? oldVNode.data.event : {}
  let newEvent = newVNode.data.event || {}
  // 移除旧节点里存在新节点里不存在的事件
  Object.keys(oldEvent).forEach(item => {
    if (newEvent[item] === undefined || oldEvent[item] !== newEvent[item]) {
      el.removeEventListener(item, oldEvent[item])
    }
  })
  // 添加旧节点不存在的新事件
  Object.keys(newEvent).forEach(item => {
    if (oldEvent[item] !== newEvent[item]) {
      el.addEventListener(item, newEvent[item])
    }
  })
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-28 16:42:15
 * @Desc: 打补丁
 */
const patchVNode = (oldVNode, newVNode) => {
  if (oldVNode === newVNode) {
    return
  }
  // 元素标签相同，进行patch
  if (oldVNode.tag === newVNode.tag) {
    // 元素类型相同，那么旧元素肯定是进行复用的
    let el = (newVNode.el = oldVNode.el)
    updateClass(el, newVNode)
    updateStyle(el, oldVNode, newVNode)
    updateAttr(el, oldVNode, newVNode)
    updateEvent(el, oldVNode, newVNode)
    // 新节点的子节点是文本节点
    if (newVNode.text) {
      // 移除旧节点的子节点
      if (oldVNode.children) {
        oldVNode.children.forEach(item => {
          removeEvent(item)
          el.removeChild(item.el)
        })
      }
      // 文本内容不相同则更新文本
      if (oldVNode.text !== newVNode.text) {
        el.textContent = newVNode.text
      }
    } else {
      // 新旧节点都存在子节点，那么就要进行diff
      if (oldVNode.children && newVNode.children) {
        diff(el, oldVNode.children, newVNode.children)
      } else if (oldVNode.children) {
        // 新节点不存在子节点，那么移除旧节点的所有子节点
        oldVNode.children.forEach(item => {
          removeEvent(item)
          el.removeChild(item.el)
        })
      } else if (newVNode.children) {
        // 新节点存在子节点
        // 旧节点存在文本节点则移除
        if (oldVNode.text) {
          el.textContent = ''
        }
        // 添加新节点的子节点
        newVNode.children.forEach(item => {
          el.appendChild(createEl(item))
        })
      } else if (oldVNode.text) {
        // 新节点啥也没有，旧节点存在文本节点
        el.textContent = ''
      }
    }
  } else {
    // 不同使用newNode替换oldNode
    let newEl = createEl(newVNode)
    updateClass(newEl, newVNode)
    updateStyle(newEl, null, newVNode)
    updateAttr(newEl, null, newVNode)
    removeEvent(oldNode)
    updateEvent(newEl, null, newVNode)
    let parent = oldVNode.el.parentNode
    parent.insertBefore(newEl, oldVNode.el)
    parent.removeChild(oldVNode.el)
  }
}

/**
 * javascript comment
 * @Author: 王林25
 * @Date: 2021-06-28 15:55:23
 * @Desc: 入口方法
 */
export const patch = (oldVNode, newVNode, handles, waitFn) => {
  waitFn && (wait = waitFn);
  callbacks = handles
  // dom元素转换成vnode
  if (!oldVNode.tag) {
    let el = oldVNode
    el.innerHTML = ''
    oldVNode = h(oldVNode.tagName.toLowerCase())
    oldVNode.el = el
  }
  patchVNode(oldVNode, newVNode)
  return newVNode
}

/*
  
  let preVNode = patch(document.getElementById('app'), h('div',{
      class: {
        btn: true
      },
      style: {
        fontSize: '30px'
      },
      attr: {
        id: 'a'
      },
      event: {
        mouseover: () => {
          alert('移入我')
        }
      }
    }, '旧'))
    setTimeout(() => {
        let newVNode = h('div', {
          class: {
            btn: true,
            warning: false,
            bg: true
          },
          style: {
            fontWeight: 'bold',
            fontStyle: 'italic'
          },
          event: {
            click: () => {
              alert('点了我')
            }
          }
        }, '新')
        console.log(preVNode, newVNode)
        patch(preVNode, newVNode)
    }, 10000);
  */
