<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { patch, h } from '../doubleEndedDiff/index'
import { useStore } from '../store'

const store = useStore()
// 指针
const oldPointerList = ref([])
const newPointerList = ref([])
// 不可见列表，用来作为初始旧的VNode的关联元素
const _oldVNodeList = computed(() => {
  return JSON.parse(store.oldVNode)
})
const _newVNodeList = computed(() => {
  return JSON.parse(store.newVNode)
})
const oldNodeList = ref([])
const oldNode = ref(null)
// 新旧节点列表
const oldVNodeList = ref([])
const newVNodeList = ref([])
// 当前比较中的节点索引
const currentCompareOldNodeIndex = ref(-1)
const currentCompareNewNodeIndex = ref(-1)
// 要被删除的节点索引
const currentDeleteNodeIndex = ref(-1)
// 提示信息
const info = ref('')

// 在节点列表查找某个节点所在索引
const findIndex = (vnode, list) => {
  return !vnode
    ? -1
    : (list || oldVNodeList.value).findIndex(item => {
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

const handles = {
  // 更新指针
  updatePointers(oldStartIdx, oldEndIdx, newStartIdx, newEndIdx) {
    oldPointerList.value = [
      {
        name: 'oldStartIdx',
        value: findPointerIndex(oldStartIdx, 'old')
      },
      {
        name: 'oldEndIdx',
        value: findPointerIndex(oldEndIdx, 'old')
      }
    ]
    newPointerList.value = [
      {
        name: 'newStartIdx',
        value: findPointerIndex(newStartIdx, 'new')
      },
      {
        name: 'newEndIdx',
        value: findPointerIndex(newEndIdx, 'new')
      }
    ]
  },
  // 移动节点
  moveNode(oldIndex, newIndex, empty = false) {
    let oldVNode = _oldVNodeList.value[oldIndex]
    let newVNode = _oldVNodeList.value[newIndex]
    let fromIndex = findIndex(oldVNode)
    let toIndex = findIndex(newVNode)
    oldVNodeList.value[fromIndex] = empty ? null : '#'
    oldVNodeList.value.splice(toIndex, 0, oldVNode)
    oldVNodeList.value = oldVNodeList.value.filter(item => {
      return item !== '#'
    })
  },
  // 插入节点
  insertNode(newVNode, index) {
    // oldVNodeList.value.splice(index, 0, newVNode)
  },
  // 删除节点
  removeChild(index) {
    let vNode = _oldVNodeList.value[index]
    let targetIndex = findIndex(vNode)
    oldVNodeList.value.splice(targetIndex, 1)
  },
  // 更新当前比较节点
  updateCompareNodes(a, b) {
    if (a === -1) {
      currentCompareOldNodeIndex.value = -1
    } else {
      currentCompareOldNodeIndex.value = findPointerIndex(a, 'old')
    }
    if (b === -1) {
      currentCompareNewNodeIndex.value = -1
    } else {
      currentCompareNewNodeIndex.value = findPointerIndex(b, 'new')
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
      currentDeleteNodeIndex.value = findPointerIndex(index, 'old')
    }
  }
}

// 启动
const start = () => {
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
    patch(oldVNode, newVNode, handles)
  })
}
</script>

<template>
  <div class="content">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="btn" @click="start">启动</div>
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
          <div class="nodeList old">
            <div class="name" v-if="oldVNodeList.length > 0">旧VNode</div>
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
          <div class="nodeList new">
            <div class="name" v-if="newVNodeList.length > 0">新VNode</div>
            <div class="nodes">
              <div
                class="nodeWrap"
                v-for="(item, index) in newVNodeList"
                :key="item.data.key"
                :class="{
                  current: currentCompareNewNodeIndex === index,
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
        <!-- 隐藏 -->
        <div class="hide">
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
    height: 50px;
    border-bottom: 1px solid #000;
    display: flex;
    align-items: center;
    padding: 0 20px;

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
    }
  }

  .playgroundBox {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .playground {
      height: 500px;

      .pointer {
        height: 100px;
        margin-left: 100px;
        position: relative;

        .pointerItem {
          width: 100px;
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

      .nodeListBox {
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;

        .nodeList {
          height: 100px;
          display: flex;
          align-items: center;

          .name {
            width: 100px;
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
            }
          }
        }

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
