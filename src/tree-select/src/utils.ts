import { SelectBaseOption } from '../../select/src/interface'
import { Key } from '../../tree/src/interface'
import { TreeSelectOption } from './interface'

export function treeOption2SelectOption (
  treeOpt: TreeSelectOption
): SelectBaseOption {
  return {
    ...treeOpt,
    value: treeOpt.key
  }
}

export function filterTree (
  tree: TreeSelectOption[],
  filter: (pattern: string, v: TreeSelectOption) => boolean,
  pattern: string
): {
    filteredTree: TreeSelectOption[]
    expandedKeys: Key[]
    highlightKeySet: Set<Key>
  } {
  const visitedTailKeys = new Set<Key>()
  const visitedNonTailKeys = new Set<Key>()
  const highlightKeySet = new Set<Key>()
  const expandedKeys: Key[] = []
  const filteredTree: TreeSelectOption[] = []
  const path: TreeSelectOption[] = []
  function visit (t: TreeSelectOption[]): void {
    t.forEach((n) => {
      path.push(n)
      if (filter(pattern, n)) {
        visitedTailKeys.add(n.key)
        highlightKeySet.add(n.key)
        for (let i = path.length - 2; i >= 0; --i) {
          const { key } = path[i]
          if (!visitedNonTailKeys.has(key)) {
            visitedNonTailKeys.add(key)
            if (visitedTailKeys.has(key)) {
              visitedTailKeys.delete(key)
            }
          } else {
            break
          }
        }
      }
      if (n.children) {
        visit(n.children)
      }
      path.pop()
    })
  }
  visit(tree)
  function build (t: TreeSelectOption[], sibs: TreeSelectOption[]): void {
    t.forEach((n) => {
      const { key } = n
      const isVisitedTail = visitedTailKeys.has(key)
      const isVisitedNonTail = visitedNonTailKeys.has(key)
      if (!isVisitedTail && !isVisitedNonTail) return
      const { children } = n
      if (children) {
        if (isVisitedTail) {
          // If it is visited path tail, use origin node
          sibs.push(n)
        } else {
          // It it is not visited path tail, use cloned node
          expandedKeys.push(n.key)
          const clonedNode = { ...n, children: [] }
          sibs.push(clonedNode)
          build(children, clonedNode.children)
        }
      } else {
        sibs.push(n)
      }
    })
  }
  build(tree, filteredTree)
  return {
    filteredTree,
    highlightKeySet,
    expandedKeys
  }
}
