import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => {
    return {
      oldVNode: `[
  {
    "tag": "div",
    "children": "a",
    "data": {
      "key": 1
    }
  },
  {
    "tag": "div",
    "children": "b",
    "data": {
      "key": 2
    }
  },
  {
    "tag": "div",
    "children": "g",
    "data": {
      "key": 3
    }
  },
  {
    "tag": "div",
    "children": "c",
    "data": {
      "key": 4
    }
  },
  {
    "tag": "div",
    "children": "d",
    "data": {
      "key": 5
    }
  },
  {
    "tag": "div",
    "children": "h",
    "data": {
      "key": 6
    }
  },
  {
    "tag": "div",
    "children": "e",
    "data": {
      "key": 7
    }
  },
  {
    "tag": "div",
    "children": "f",
    "data": {
      "key": 8
    }
  }
]`,
      newVNode: `[
  {
    "tag": "div",
    "children": "b",
    "data": {
      "key": 2
    }
  },
  {
    "tag": "div",
    "children": "e",
    "data": {
      "key": 7
    }
  },
  {
    "tag": "div",
    "children": "c",
    "data": {
      "key": 4
    }
  },
  {
    "tag": "div",
    "children": "d",
    "data": {
      "key": 5
    }
  },
  {
    "tag": "div",
    "children": "i",
    "data": {
      "key": 9
    }
  },
  {
    "tag": "div",
    "children": "a",
    "data": {
      "key": 1
    }
  },
  {
    "tag": "div",
    "children": "f",
    "data": {
      "key": 8
    }
  }
]`
    }
  }
})
