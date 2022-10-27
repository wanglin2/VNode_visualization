<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { patch, h } from '../doubleEndedDiff/index'
import { useStore } from '../store'

const store = useStore()
// 指针
const oldPointerList = ref([])
const newPointerList = ref([])
// 不可见列表，用来作为初始旧的VNode的关联元素
const showHiddenNodeList = ref(true)
const _oldVNodeList = computed(() => {
  return JSON.parse(store.oldVNode)
})
const _newVNodeList = computed(() => {
  return JSON.parse(store.newVNode)
})
const oldNodeList = ref([])
const oldNode = ref(null)
// 真实DOM节点列表
const actNodeList = ref([])
// 新旧节点列表
const oldVNodeList = ref([])
const newVNodeList = ref([])
// 当前比较中的节点索引
const currentCompareOldNodeIndex = ref(-1)
const currentCompareNewNodeIndex = ref(-1)
// 要被删除的节点索引
const currentDeleteNodeIndex = ref(-1)
// 要被添加的节点索引
const currentAddNodeIndex = ref(-1)
// 提示信息
const info = ref('')
// 速度
const speed = ref(3000)
// 是否正在运行中
const isRunning = ref(false)

// 复位
const reset = () => {
  showHiddenNodeList.value = false
  oldPointerList.value = []
  newPointerList.value = []
  actNodeList.value = []
  oldVNodeList.value = []
  newVNodeList.value = []
  currentCompareOldNodeIndex.value = -1
  currentCompareNewNodeIndex.value = -1
  currentDeleteNodeIndex.value = -1
  currentAddNodeIndex.value = -1
  info.value = ''
  isRunning.value = false
}

// 在节点列表节点列表查找某个节点所在索引
const findIndex = (vnode, list) => {
  return !vnode
    ? -1
    : (list || actNodeList.value).findIndex(item => {
        return item && item.data.key === vnode.data.key
      })
}
const findPointerIndex = (index, type) => {
  if (type === 'old') {
    let vNode = _oldVNodeList.value[index]
    return findIndex(vNode)
  }
  if (type === 'new') {
    let vNode = _newVNodeList.value[index]
    return findIndex(vNode, newVNodeList.value)
  }
}

// 操作
const handles = {
  // 更新指针
  updatePointers(oldStartIdx, oldEndIdx, newStartIdx, newEndIdx) {
    oldPointerList.value = [
      {
        name: 'oldStartIdx',
        value: oldStartIdx //findPointerIndex(oldStartIdx, 'old')
      },
      {
        name: 'oldEndIdx',
        value: oldEndIdx //findPointerIndex(oldEndIdx, 'old')
      }
    ]
    newPointerList.value = [
      {
        name: 'newStartIdx',
        value: newStartIdx //findPointerIndex(newStartIdx, 'new')
      },
      {
        name: 'newEndIdx',
        value: newEndIdx //findPointerIndex(newEndIdx, 'new')
      }
    ]
  },
  // 移动节点
  moveNode(oldIndex, newIndex, empty = false) {
    let oldVNode = _oldVNodeList.value[oldIndex]
    let newVNode = _oldVNodeList.value[newIndex]
    let fromIndex = findIndex(oldVNode)
    let toIndex = findIndex(newVNode)
    actNodeList.value[fromIndex] = '#'
    actNodeList.value.splice(toIndex, 0, oldVNode)
    actNodeList.value = actNodeList.value.filter(item => {
      return item !== '#'
    })
    if (empty) {
      oldVNodeList.value[fromIndex] = null
    }
  },
  // 插入节点
  insertNode(newVNode, index, inNewVNode) {
    let node = {
      data: newVNode.data,
      children: newVNode.text
    }
    let targetIndex = 0
    if (index === -1) {
      actNodeList.value.push(node)
    } else {
      if (inNewVNode) {
        let vNode = _newVNodeList.value[index]
        targetIndex = findIndex(vNode)
      } else {
        let vNode = _oldVNodeList.value[index]
        targetIndex = findIndex(vNode)
      }
      actNodeList.value.splice(targetIndex, 0, node)
    }
  },
  // 删除节点
  removeChild(index) {
    let vNode = _oldVNodeList.value[index]
    let targetIndex = findIndex(vNode)
    actNodeList.value.splice(targetIndex, 1)
  },
  // 更新当前比较节点
  updateCompareNodes(a, b) {
    if (a === -1) {
      currentCompareOldNodeIndex.value = -1
    } else {
      currentCompareOldNodeIndex.value = a //findPointerIndex(a, 'old')
    }
    if (b === -1) {
      currentCompareNewNodeIndex.value = -1
    } else {
      currentCompareNewNodeIndex.value = b //findPointerIndex(b, 'new')
    }
  },
  // 更新提示信息
  updateInfo(tip) {
    info.value = tip
  },
  // 更新即将要被删除的节点
  updateDeleteNode(index) {
    if (index === -1) {
      currentDeleteNodeIndex.value = -1
    } else {
      currentDeleteNodeIndex.value = index //findPointerIndex(index, 'old')
    }
  },
  // 更新即将新增的节点
  updateAddNode(index) {
    if (index === -1) {
      currentAddNodeIndex.value = -1
    } else {
      currentAddNodeIndex.value = index
    }
  },
  // 完成
  done() {
    isRunning.value = false
  }
}

// 启动
const start = () => {
  if (isRunning.value) {
    return
  }
  reset()
  nextTick(() => {
    showHiddenNodeList.value = true
    isRunning.value = true
    actNodeList.value = JSON.parse(store.oldVNode)
    oldVNodeList.value = JSON.parse(store.oldVNode)
    newVNodeList.value = JSON.parse(store.newVNode)
    nextTick(() => {
      let oldVNode = h(
        'div',
        { key: 1 },
        JSON.parse(store.oldVNode).map((item, index) => {
          let vnode = h(item.tag, item.data, item.children)
          vnode.el = oldNodeList.value[index]
          return vnode
        })
      )
      oldVNode.el = oldNode.value
      let newVNode = h(
        'div',
        { key: 1 },
        JSON.parse(store.newVNode).map(item => {
          return h(item.tag, item.data, item.children)
        })
      )
      patch(oldVNode, newVNode, handles, speed.value)
    })
  })
}
</script>

<template>
  <div class="content">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="left">
        <div class="btn" @click="start" :class="{ disabled: isRunning }">
          启动
        </div>
        <div class="inputBox">
          <span class="name">速度(单位：ms)：</span>
          <input type="text" v-model="speed" />
        </div>
      </div>
      <div class="right">
        <div class="title">Diff算法动画演示</div>
      </div>
    </div>
    <!-- 主体 -->
    <div class="playgroundBox">
      <div class="playground">
        <!-- 指针 -->
        <div class="pointer">
          <div
            class="pointerItem"
            v-for="item in oldPointerList"
            :key="item.name"
            :style="{ left: item.value * 120 + 'px' }"
          >
            <div class="pointerItemName">{{ item.name }}</div>
            <div class="pointerItemValue">{{ item.value }}</div>
            <img src="../assets/箭头_向下.svg" alt="" />
          </div>
        </div>
        <div class="nodeListBox">
          <!-- 旧节点列表 -->
          <div class="nodeList">
            <div class="name" v-if="oldVNodeList.length > 0">旧的VNode列表</div>
            <div class="nodes">
              <TransitionGroup name="list">
                <div
                  class="nodeWrap"
                  v-for="(item, index) in oldVNodeList"
                  :key="item ? item.data.key : index"
                  :class="{
                    current: currentCompareOldNodeIndex === index,
                    delete: currentDeleteNodeIndex === index,
                    end:
                      oldPointerList.length > 0 &&
                      (index < oldPointerList[0].value ||
                        index > oldPointerList[oldPointerList.length - 1].value)
                  }"
                >
                  <div class="node">{{ item ? item.children : '空' }}</div>
                </div>
              </TransitionGroup>
            </div>
          </div>
          <!-- 新节点列表 -->
          <div class="nodeList">
            <div class="name" v-if="newVNodeList.length > 0">新的VNode列表</div>
            <div class="nodes">
              <div
                class="nodeWrap"
                v-for="(item, index) in newVNodeList"
                :key="item.data.key"
                :class="{
                  current: currentCompareNewNodeIndex === index,
                  add: currentAddNodeIndex === index,
                  end:
                    newPointerList.length > 0 &&
                    (index < newPointerList[0].value ||
                      index > newPointerList[newPointerList.length - 1].value)
                }"
              >
                <div class="node">{{ item.children }}</div>
              </div>
            </div>
          </div>
          <!-- 提示信息 -->
          <div class="info">{{ info }}</div>
        </div>
        <!-- 指针 -->
        <div class="pointer">
          <div
            class="pointerItem"
            v-for="item in newPointerList"
            :key="item.name"
            :style="{ left: item.value * 120 + 'px' }"
          >
            <img src="../assets/箭头_向上.svg" alt="" />
            <div class="pointerItemValue">{{ item.value }}</div>
            <div class="pointerItemName">{{ item.name }}</div>
          </div>
        </div>
        <!-- 真实DOM列表 -->
        <div class="nodeList act" v-if="actNodeList.length > 0">
          <div class="name">真实DOM列表</div>
          <div class="nodes">
            <TransitionGroup name="list">
              <div
                class="nodeWrap"
                v-for="item in actNodeList"
                :key="item.data.key"
              >
                <div class="node">{{ item.children }}</div>
              </div>
            </TransitionGroup>
          </div>
        </div>
        <!-- 隐藏 -->
        <div class="hide" v-if="showHiddenNodeList">
          <div class="nodes" ref="oldNode">
            <div
              v-for="(item, index) in _oldVNodeList"
              :key="index"
              ref="oldNodeList"
            >
              {{ item.children }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
<style scoped lang="less">
.content {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    width: 100%;
    height: 50px;
    border-bottom: 1px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;

    .left {
      display: flex;
      align-items: center;

      .btn {
        height: 30px;
        padding: 0 10px;
        line-height: 30px;
        border: 1px solid #000;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;

        &:active {
          transform: translate(-1px, -1px);
        }

        &.disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }
      }

      .inputBox {
        height: 30px;
        margin-left: 50px;

        input {
          width: 80px;
          height: 100%;
          padding: 0;
          border: 1px solid #000;
          border-radius: 5px;
          outline: none;
          padding: 0 10px;
        }
      }
    }

    .right {
      .title {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }

  .playgroundBox {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .playground {
      .pointer {
        height: 100px;
        margin-left: 150px;
        position: relative;

        .pointerItem {
          width: 100px;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;

          .pointerItemName {
          }

          img {
            width: 50px;
          }
        }
      }

      .nodeList {
        display: flex;
        align-items: center;

        &.act {
          border-top: 1px solid #000;
          margin-top: 10px;
          padding-top: 10px;
        }

        .name {
          width: 150px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nodes {
          display: flex;

          .nodeWrap {
            width: 100px;
            height: 100px;
            border: 1px solid #000;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;

            &.end {
              border-style: dashed;
            }

            &.current {
              border-color: #2080f7;
              background-color: #2080f7;
              color: #fff;
            }

            &.delete {
              border-color: #e72528;
              background-color: #e72528;
              color: #fff;
            }

            &.add {
              border-color: #42c707;
              background-color: #42c707;
              color: #fff;
            }
          }
        }
      }

      .nodeListBox {
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;

        .info {
          position: absolute;
          left: 0;
          right: 0;
          height: 100px;
          top: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  .hide {
    display: none;
  }
}
</style>
