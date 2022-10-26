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
const oldNodeList = ref([])
const oldNode = ref(null)
// 新旧节点列表
const oldVNodeList = ref([])
const newVNodeList = ref([])
// 当前比较中的节点索引
const currentCompareOldNodeIndex = ref(-1)
const currentCompareNewNodeIndex = ref(-1)

// 在oldVNodeList查找某个节点所在索引
const findIndex = vnode => {
  return oldVNodeList.value.findIndex(item => {
    return item.data.key === vnode.data.key
  })
}

const handles = {
  // 更新指针
  updatePointers(e) {
    oldPointerList.value = e.oldPointerList
    newPointerList.value = e.newPointerList
  },
  // 移动节点
  moveNode(oldIndex, newIndex) {
    let oldVNode = _oldVNodeList.value[oldIndex]
    let newVNode = _oldVNodeList.value[newIndex]
    let fromIndex = findIndex(oldVNode)
    let toIndex = findIndex(newVNode)
    oldVNodeList.value[fromIndex] = '#'
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
    currentCompareOldNodeIndex.value = a
    currentCompareNewNodeIndex.value = b
  }
}

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
      <!-- 旧节点列表 -->
      <div class="nodeList old">
        <div class="name">旧节点</div>
        <div class="nodes">
          <TransitionGroup name="list">
            <div
              class="nodeWrap"
              v-for="(item, index) in oldVNodeList"
              :key="item.data.key"
              :class="{
                current: currentCompareOldNodeIndex === index,
                end:
                  oldPointerList.length > 0 &&
                  (index < oldPointerList[0].value ||
                    index > oldPointerList[oldPointerList.length - 1].value)
              }"
            >
              <div class="node">{{ item.children }}</div>
            </div>
          </TransitionGroup>
        </div>
      </div>
      <!-- 新节点列表 -->
      <div class="nodeList new">
        <div class="name">新节点</div>
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

  .playground {
    width: 100%;
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

    .nodeList {
      height: 100px;
      display: flex;
      align-items: center;

      &.old {
        margin-bottom: 100px;
      }

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
        }
      }
    }
  }

  .hide {
    display: none;
  }
}
</style>
