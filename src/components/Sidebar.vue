<script setup>
import { onMounted, ref } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/fold/foldgutter'
import { useStore } from '../store'

const store = useStore()
const active = ref('old')
const editorBox = ref(null)
let editor = null

const changeTab = type => {
  active.value = type
  if (editor) {
    let content = active.value === 'old' ? store.oldVNode : store.newVNode
    editor.setValue(content)
  }
}

onMounted(() => {
  editor = CodeMirror(editorBox.value, {
    value: '',
    mode: 'javascript',
    lineNumbers: true,
    autoCloseBrackets: true,
    autoCloseTags: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  })
  editor.on('change', doc => {
    let content = doc.getValue()
    switch (active.value) {
      case 'old':
        store.oldVNode = content
        break
      case 'new':
        store.newVNode = content
        break
      default:
        break
    }
  })
  changeTab('old')
})
</script>

<template>
  <div class="sidebar">
    <div class="tab">
      <div
        class="tabItem"
        :class="{ active: active === 'old' }"
        @click="changeTab('old')"
      >
        旧VNode
      </div>
      <div
        class="tabItem"
        :class="{ active: active === 'new' }"
        @click="changeTab('new')"
      >
        新VNode
      </div>
    </div>
    <div class="editor" ref="editorBox"></div>
  </div>
</template>

<style scoped lang="less">
.sidebar {
  width: 400px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid #000;
  display: flex;
  flex-direction: column;

  .tab {
    width: 100%;
    display: flex;
    height: 50px;
    border-bottom: 1px solid #000;
    flex-shrink: 0;

    .tabItem {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      cursor: pointer;

      &:first-of-type {
        border-right: 1px solid #000;
      }

      &.active {
        background-color: #000;
        color: #fff;
      }
    }
  }

  .editor {
    width: 100%;
    flex-grow: 1;
    overflow: hidden;

    /deep/.CodeMirror {
      line-height: 1.5;
      height: 100%;
    }
  }
}
</style>
