// class N {
//   constructor (line, nodeIndex = 0, nestingLevel = 0) {
//     this.line = line
//     this.nodeIndex = nodeIndex
//     this.nestingLevel = nestingLevel
//     this.nodes = [this]
//   }
// }

class Xmltr {
  constructor (data, range, parentObjects) {
    if (typeof data === 'string') {
      this.nodes = this._parse(data)
    } else if (Array.isArray(data)) {
      this.nodes = data
    } else {
      throw Error('Invalid data passed to Nodes constructor')
    }
    this.range = range || { from: 0, to: this.nodes.length }
    this.parentObjects = parentObjects || []
  }

  static fromNode (xmltr, node) {
    return new Xmltr(xmltr.nodes, { from: node.nodeIndex, to: node.nodeIndex + 1 }, xmltr.parentObjects)
  }

  getAttr (...names) {
    if (names.length < 1) {
      throw Error('Node::getAttr requires at least one attribute name')
    }
    const values = names.map(name => this._tagNodeArrayDescription(name).first.attrValue)
    return values.length > 1 ? values : values[0]
  }

  getMultiAttr (...names) {
    if (names.length < 1) {
      throw Error('Node::getMultiAttr requires at least one attribute name')
    }
    const nameValues = names
      .map(name =>
        this._tagNodeArrayDescription(name).all.attrsValues.map(av => av[1])
      )
      .map(nameValues => nameValues.filter(nameValue => nameValue !== undefined))

    return nameValues.length > 1 ? nameValues : nameValues[0]
  }

  rmAttr (...names) {
    if (names.length < 1) {
      throw Error('Node:rmAttr requires at least one attribute name')
    }
    const nameValues = names.map(name => {
      const { tagName, attrIndex, attrs, attrName } = this._tagNodeArrayDescription(name).first

      if (attrName !== undefined) {
        delete attrs[attrIndex]
        this.selfShallow().line = `<${tagName} ${attrs.join(' ')}>`
        return true
      }

      return false
    })

    return nameValues.length > 1 ? nameValues : nameValues[0]
  }

  rmMultiAttr (...names) {
    if (names.length < 1) {
      throw Error('Node:rmMultiAttr requires at least one attribute name')
    }

    const attrsIndexes = names
      .reduce((indexes, name) => {
        indexes.push(...this._tagNodeArrayDescription(name).all.attrsIndexes)
        return indexes
      }, [])
    const rmResult = names
      .map(name => this._tagNodeArrayDescription(name).all.attrsIndexes.length)

    const [tagName, ...attrs] = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []

    if (attrsIndexes.length > 0) {
      attrsIndexes.forEach(i => delete attrs[i])
      this.line = `<${tagName} ${attrs.join(' ')}>`
      return rmResult
    }

    return 0
  }

  setAttr (name, value) {
    const { tagName, attrIndex, attrs, attr, attrName } = this._tagNodeArrayDescription(name).first

    if (attrName !== undefined) {
      attrs[attrIndex] = value !== undefined ? `${name}="${value}"` : name
    } else {
      attrs.push(value !== undefined ? `${attr}="${value}"` : name)
    }

    this.selfShallow().line = `<${tagName} ${attrs.join(' ')}>`
  }

  setMultiAttr (name, values = []) {
    const [tagName, ...attrs] = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []

    attrs.push(...values.map(value => `${name}="${value}"`))

    this.selfShallow().line = `<${tagName} ${attrs.join(' ')}>`
  }

  _tagDesc () {
    this._throwErrorWhenNotSingleTagNode()
    const nodeParts = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []
    const tagName = nodeParts.shift()
    const attrs = nodeParts.reduce((result, attrVal) => {
      let [name, value] = attrVal.split('="')
      value = value !== undefined ? value.substring(0, value.length - 1) : undefined
      result[name] = value
      return result
    }, {})

    return { tagName, attrs }
  }

  byTags (...tags) {
    this.parentObjects.push(this)
    return this.selfDeep()
      .filter(node => tags.includes(Xmltr.fromNode(this, node).tagName()))
      .map(node => Xmltr.fromNode(this, node))
  }

  byAttrs (...filters) {
    this.parentObjects.push(this)
    // return this.selfDeep()
    //   .filter(node => filters
    //     .map(filter => Xmltr.fromNode(this, node).getAttr(filter) !== undefined)
    //     .find(filterMatches => filterMatches === true) !== undefined)
    return this.selfDeep()
      .filter(node => filters.map(f => node.line.indexOf(` ${f}`) > 0).find(e => e === true))
      .map(node => Xmltr.fromNode(this, node))
  }

  // _searchNodesSubset () {
  //   const { from, to } = this.range
  //   return this.nodes.slice(from, to)
  // }

  byAttrsVals (...filters) {
    this.parentObjects.push(this)
    // return this._searchNodesSubset()
    //   .filter(node => filters
    //     .map(filter => {
    //       const [filterAttrName, filterAttrValue] = filter.split('=')
    //         .map(elem => elem.replaceAll('"', ''))
    //       return node.getMultiAttr(filterAttrName).includes(filterAttrValue)
    //     })
    //     .find(filterMatches => filterMatches === true) !== undefined)
    return this.selfDeep()
      .filter(node => filters.map(f => node.line.indexOf(` ${f}`) > 0).find(e => e === true))
      .map(node => Xmltr.fromNode(this, node))
  }

  _tagNodeArrayDescription (name) {
    this._throwErrorWhenNotSingleTagNode()
    const nodeParts = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []
    const [tagName, ...attrs] = nodeParts
    const indexedAttrs = attrs.map((attr, index) => [index, attr])
    const selectedIndexedAttrs = indexedAttrs
      .filter(indexedAttr => indexedAttr[1].split('=')[0] === name)
    const attrsIndexes = selectedIndexedAttrs
      .map(selectedIndexedAttr => selectedIndexedAttr[0])
    let attrsValues = selectedIndexedAttrs.map(([, attr]) => {
      const [attrName, attrValue] = attr.split('=')
        .map(elem => elem.replaceAll('"', ''))

      if (attrName !== undefined) {
        return [attrName, attrValue !== undefined ? attrValue : true]
      } else {
        return [attrName, null]
      }
    })
    attrsValues = attrsValues.length > 0 ? attrsValues : [[]]

    return {
      first: {
        tagName,
        attr: attrs[0],
        attrs,
        attrIndex: attrsIndexes[0],
        attrName: attrsValues[0][0],
        attrValue: attrsValues[0][1]
      },
      all: { tagName, attrs, attrsIndexes, attrsValues }
    }
  }

  rm () {
    const { from, length } = this.selfRange()
    this.nodes.splice(from, length)
    this._renumber()
  }

  after (node) {
    // const self = this.selfShallow()
    const { from, length } = this.selfRange()
    const currentNestingLevel = this.nodes[from].nestingLevel
    // console.log(this, from, node)
    // console.log('NODE_NODES', node.nodes)
    this._substituteFromLength(node, from + length, 0, currentNestingLevel)
    // node.nodes.forEach((node, index) => {
    //   node.nestingLevel = index + self.nestingLevel
    // })
    // console.log('NODE_NODES_AFTER', node.nodes)
    // // console.log(node)
    // this.nodes.splice(from, length, ...node.nodes)
    // this._renumber()
    // this.range = { from: }
  }

  before (node) {
    const { from } = this.selfRange()
    const currentNestingLevel = this.nodes[from].nestingLevel
    // console.log(this, from, node)
    this._substituteFromLength(node, from, 0, currentNestingLevel)
  }

  replace (node) {
    const { from, length } = this.selfRange()
    const currentNestingLevel = this.nodes[from].nestingLevel
    this._substituteFromLength(node, from, length, currentNestingLevel)
  }

  insertChild (node, index = -1) {
    console.log(this.nodes, node.nodes)
    // if (index === -1) {
    //   index = this.children().length
    // }
    // const current = this.selfShallow()
    // node.nodes.forEach((node, index) => {
    //   node.nestingLevel += current.nestingLevel + 1
    // })
    // if (index === 0) {
    //   // console.log('TU_WPADA', current)
    //   this.nodes.splice(this.range.from + 1, 0, ...node.nodes)
    //   // this.after(node)
    //   this.range.to += node.nodes.length
    //   // console.log('NEW_THIS', this, this.nodes)
    // } else if (index === this.children().length) {
    //   this.children()[index - 1].after(node)
    // } else {
    //   this.children()[index].before(node)
    // }
    // this._renumber()
  }

  _substituteFromLength (node, from, length, currentNestingLevel) {
    node.nodes.forEach((node, index) => {
      node.nestingLevel = node.nestingLevel + currentNestingLevel
    })
    this.nodes.splice(from, length, ...node.nodes)
    this._renumber()
  }

  _renumber () {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].nodeIndex = i
    }
    this.parentObjects.forEach(obj => { obj.range = obj.selfRange() })
  }

  tagName () {
    return this._tagDesc().tagName
  }

  parent () {
    const { nodeIndex, nestingLevel } = this.selfShallow()
    for (let i = nodeIndex; i > -1; i--) {
      if (this.nodes[i].nestingLevel === nestingLevel - 1) {
        return Xmltr.fromNode(this, this.nodes[i])
      }
    }
    return null
  }

  previous () {
    const parent = this.parent()
    if (!parent) { return null }
    const children = parent.children()
    const currentChildIndex = children
      .findIndex(child => child.range.from === this.range.from && child.range.to === this.range.to)
    return children[currentChildIndex - 1]
  }

  next () {
    const parent = this.parent()
    if (!parent) { return null }
    const children = parent.children()
    const currentChildIndex = children
      .findIndex(child => child.range.from === this.range.from && child.range.to === this.range.to)
    return children[currentChildIndex + 1]
  }

  children () {
    // if (!this.selfDeep().length) { return [] }
    // const children = []
    // const { nodeIndex, nestingLevel } = this
    // for (let i = nodeIndex + 1; i < this.nodes.length; i++) {
    //   if (this.nodes[i].nestingLevel <= nestingLevel) {
    //     return children
    //   } else if (this.nodes[i].nestingLevel === nestingLevel + 1) {
    //     children.push(this.nodes[i])
    //   }
    // }
    // return children
    const { nestingLevel } = this.selfShallow()
    return this.selfDeep()
      .filter(node => node.nestingLevel === nestingLevel + 1)
      .map(node => Xmltr.fromNode(this, node))
  }

  isTagNode () {
    return this.line[0] === '<'
  }

  isTextNode () {
    return this._nodeDescription()[0] === '#'
  }

  selfRange () {
    const from = this.range.from
    let length = 1
    for (let i = from + 1; i < this.nodes.length; i++) {
      if (this.nodes[i].nestingLevel > this.selfShallow().nestingLevel) {
        length++
      } else {
        break
      }
    }
    return { from, length }
  }

  // _cloneNodeDeep () {
  //   const { from, length } = this.selfDeep()
  //   const deepClone = []
  //   for (let i = from; i < from + length; i++) {
  //     deepClone.push(this.nodes[i]._cloneNodeShallow())
  //   }
  //   return deepClone
  // }

  // _cloneNodeShallow () {
  //   const { line, nodeIndex, nestingLevel } = this
  //   return JSON.parse(JSON.stringify({ line, nodeIndex, nestingLevel }))
  // }

  _throwErrorWhenNotSingleNode () {
    return
    if (this.range.to - this.range.from !== 1) {
      throw Error('Xmltr points at many nodes, not a single node')
    }
  }

  _throwErrorWhenNotSingleTagNode () {
    return
    this._throwErrorWhenNotSingleNode()
    if (this.isTextNode()) {
      throw Error('Accessing tag in text node')
    }
  }

  // root () {
  //   return Xmltr.fromNode(this, this.nodes[0])
  // }

  // byAttrsVals (...filters) {
  //   return this.nodes.filter(node => {
  //     const nodeParts = node._nodeDescription().match(/[a-zA-Z-_]+="[^"]+"/g) || []
  //     return (new Set([...filters, ...nodeParts])).size === nodeParts.length
  //   })
  // };

  // byTags (...tags) {
  //   return this.nodes.filter(node => tags.includes(node.tagName()))
  // }

  // byAttrs (...filters) {
  //   return this.nodes.filter(node => {
  //     const attrs = (node._nodeDescription().match(/[a-zA-Z-_]+="[^"]+"|[a-zA-Z-_]+/g) || []).map(attrVal => attrVal.split('=')[0])
  //     attrs.shift()
  //     return (new Set([...filters, ...attrs])).size === attrs.length
  //   })
  // }

  _extract (xml) {
    const nodes = []
    let node = ''
    for (let i = 0; i < xml.length; i++) {
      let tagStarted = false
      const char = xml[i]
      if (char === '<') {
        nodes.push(node)
        node = '<'
        if (tagStarted) {
          throw Error(`Invalid open tag character at ${i}`)
        }
        tagStarted = true
      } else if (char === '>') {
        node += char
        nodes.push(node)
        node = ''
        tagStarted = false
      } else {
        node += char
      }
    }
    nodes.push(node)
    return nodes
  }

  _parse (xml) {
    const lines = this._extract(xml)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let nodeIndex = 0
    let nestingLevel = 0
    const nodes = []

    lines.forEach(line => {
      if (line[line.length - 2] === '/') {
        nodes.push({ line, nodeIndex, nestingLevel })
        nodeIndex++
      } else if (line[1] === '/') {
        nestingLevel--
      } else {
        nodes.push({ line, nodeIndex, nestingLevel })
        if (line[0] === '<') {
          nestingLevel++
        }
        nodeIndex++
      }
    })

    nodes.forEach(node => { node.nodes = nodes })

    return nodes
  }

  // toString () {
  //   return `[\n${this.toArrayOfStrings()}\n]`
  // }

  _nodeDescription () {
    const current = this.selfShallow()
    //console.log('CURRENT', current.line)
    if (current.line[0] === '<') {
      return current.line.substr(1, current.line.length - 2)
    }

    return `#text ${current.line}`
  }

  toString () {
    const results = this.nodes.slice(this.range.from, this.range.to).map(node => {
      return `[nodeDescription=[${Xmltr.fromNode(this, node)._nodeDescription()}] nodeIndex=[${node.nodeIndex}] nestingLevel=[${node.nestingLevel}]]`
    })

    return results.length === 1 ? results[0] : results
  }

  selfShallow () {
    return this.nodes[this.range.from]
  }

  selfDeep () {
    const { from, length } = this.selfRange()
    return this.nodes.slice(from, from + length)
  }
}

export { Xmltr }
