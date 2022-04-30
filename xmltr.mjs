// class N {
//   constructor (line, nodeIndex = 0, nestingLevel = 0) {
//     this.line = line
//     this.nodeIndex = nodeIndex
//     this.nestingLevel = nestingLevel
//     this.nodes = [this]
//   }
// }

class Xmltr {
  constructor (data, range) {
    if (typeof data === 'string') {
      this.nodes = this._parse(data)
    } else if (Array.isArray(data)) {
      this.nodes = data
    } else {
      throw Error('Invalid data passed to Nodes constructor')
    }
    this.range = range || { from: 0, to: this.nodes.length }
  }

  static fromNode (xmltr, node) {
    return new Xmltr(xmltr.nodes, { from: node.nodeIndex, to: node.nodeIndex + 1 })
  }

  getAttr (...names) {
    if (names.length < 1) {
      throw Error('Node::getAttr requires at least one attribute name')
    }
    const values = names.map(name => this.tagNodeArrayDescription(name).first.attrValue)
    return values.length > 1 ? values : values[0]
  }

  getMultiAttr (...names) {
    if (names.length < 1) {
      throw Error('Node::getMultiAttr requires at least one attribute name')
    }
    const nameValues = names
      .map(name =>
        this.tagNodeArrayDescription(name).all.attrsValues.map(av => av[1])
      )
      .map(nameValues => nameValues.filter(nameValue => nameValue !== undefined))

    return nameValues.length > 1 ? nameValues : nameValues[0]
  }

  rmAttr (...names) {
    if (names.length < 1) {
      throw Error('Node:rmAttr requires at least one attribute name')
    }
    const nameValues = names.map(name => {
      const { tagName, attrIndex, attrs, attrName } = this.tagNodeArrayDescription(name).first

      if (attrName !== undefined) {
        delete attrs[attrIndex]
        this.line = `<${tagName} ${attrs.join(' ')}>`
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
        indexes.push(...this.tagNodeArrayDescription(name).all.attrsIndexes)
        return indexes
      }, [])
    const rmResult = names
      .map(name => this.tagNodeArrayDescription(name).all.attrsIndexes.length)

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
    const { tagName, attrIndex, attrs, attr, attrName } = this.tagNodeArrayDescription(name).first

    if (attrName !== undefined) {
      attrs[attrIndex] = value !== undefined ? `${name}="${value}"` : name
    } else {
      attrs.push(value !== undefined ? `${attr}="${value}"` : name)
    }

    this.line = `<${tagName} ${attrs.join(' ')}>`
  }

  setMultiAttr (name, values = []) {
    const [tagName, ...attrs] = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []

    attrs.push(...values.map(value => `${name}="${value}"`))

    this.line = `<${tagName} ${attrs.join(' ')}>`
  }

  byAttrsVals (...filters) {
    // return this._searchNodesSubset()
    //   .filter(node => filters
    //     .map(filter => {
    //       const [filterAttrName, filterAttrValue] = filter.split('=')
    //         .map(elem => elem.replaceAll('"', ''))
    //       return node.getMultiAttr(filterAttrName).includes(filterAttrValue)
    //     })
    //     .find(filterMatches => filterMatches === true) !== undefined)
    return this._searchNodesSubset()
      .filter(node => filters.map(f => node.line.indexOf(` ${f}`) > 0).find(e => e === true))
      .map(node => Xmltr.fromNode(this, node))
  }

  _tagDesc () {
    this._throwErrorWhenNotSingleTagNode()
    const nodeParts = this._nodeDescription()
      .match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []
    const tagName = nodeParts.shift()
    const attrs = nodeParts.reduce((result, attrVal) => {
      let [name, value] = attrVal.split('="')
      value = value.substring(0, value.length - 1)
      result[name] = value
      return result
    }, {})

    return { tagName, attrs }
  }

  byTags (...tags) {
    return this._searchNodesSubset()
      .filter(node => tags.includes(Xmltr.fromNode(this, node).tagName()))
      .map(node => Xmltr.fromNode(this, node))
  }

  byAttrs (...filters) {
    // return this._searchNodesSubset()
    //   .filter(node => filters
    //     .map(filter => Xmltr.fromNode(this, node).getAttr(filter) !== undefined)
    //     .find(filterMatches => filterMatches === true) !== undefined)
    return this._searchNodesSubset()
      .filter(node => filters.map(f => node.line.indexOf(` ${f}`) > 0).find(e => e === true))
      .map(node => Xmltr.fromNode(this, node))
  }

  _searchNodesSubset () {
    const { from, to } = this.range
    return this.nodes.slice(from, to)
  }

  tagNodeArrayDescription (name) {
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
    const { from, length } = this._findNodeRange()
    this.nodes.splice(from, length)
    this._renumber()
  }

  after (node) {
    const { from, length } = this._findNodeRange()
    console.log(this, from, length, this.nodes)
    const currentNestingLevel = this.nodes[from].nestingLevel
    this._substituteFromLength(node, from + length, 0, currentNestingLevel)
  }

  before (node) {
    const { from } = this._findNodeRange()
    const currentNestingLevel = this.nodes[from].nestingLevel
    this._substituteFromLength(node, from, 0, currentNestingLevel)
  }

  replace (node) {
    const { from, length } = this._findNodeRange()
    const currentNestingLevel = this.nodes[from].nestingLevel
    this._substituteFromLength(node, from, length, currentNestingLevel)
  }

  insertChild (node, index = -1) {
    if (index === -1) {
      index = this.children().length
    }
    node.nodeIndex = this.nodeIndex + 1
    node.nestingLevel = this.nestingLevel + 1
    if (index === 0) {
      this.nodes.splice(this.nodeIndex + 1, 0, node)
    } else if (index === this.children().length) {
      this.children()[index - 1].after(node)
    } else {
      this.children()[index].before(node)
    }
    this._renumber()
  }

  _substituteFromLength (node, from, length, currentNestingLevel) {
    node.nodes.forEach((node, index) => {
      node.nestingLevel = index + currentNestingLevel
    })
    this.nodes.splice(from, length, ...node.nodes)
    this._renumber()
  }

  _renumber () {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].nodeIndex = i
    }
  }

  tagName () {
    return this._tagDesc().tagName
  }

  parent () {
    if (!this.nodes) { return null }
    const { nodeIndex, nestingLevel } = this
    for (let i = nodeIndex; i > -1; i--) {
      if (this.nodes[i].nestingLevel === nestingLevel - 1) {
        return this.nodes[i]
      }
    }
    return null
  }

  previous () {
    if (!this.nodes) { return null }
    const parent = this.parent()
    if (!parent) { return null }
    const children = parent.children()
    const currentArrIndex = children
      .findIndex(child => child.nodeIndex === this.nodeIndex)
    return children[currentArrIndex - 1]
  }

  next () {
    if (!this.nodes) { return null }
    const parent = this.parent()
    if (!parent) { return null }
    const children = parent.children()
    const currentArrIndex = children
      .findIndex(child => child.nodeIndex === this.nodeIndex)
    return children[currentArrIndex + 1]
  }

  children () {
    if (!this.nodes) { return [] }
    const children = []
    const { nodeIndex, nestingLevel } = this
    for (let i = nodeIndex + 1; i < this.nodes.length; i++) {
      if (this.nodes[i].nestingLevel <= nestingLevel) {
        return children
      } else if (this.nodes[i].nestingLevel === nestingLevel + 1) {
        children.push(this.nodes[i])
      }
    }
    return children
  }

  isTagNode () {
    return this.line[0] === '<'
  }

  isTextNode () {
    return this._nodeDescription()[0] === '#'
  }

  _findNodeRange () {
    const from = this.nodeIndex
    let length = 1
    for (let i = from + 1; i < this.nodes.length; i++) {
      if (this.nodes[i].nestingLevel > this.nestingLevel) {
        length++
      } else {
        break
      }
    }
    return { from, length }
  }

  _cloneNodeDeep () {
    const { from, length } = this._findNodeRange()
    const deepClone = []
    for (let i = from; i < from + length; i++) {
      deepClone.push(this.nodes[i]._cloneNodeShallow())
    }
    return deepClone
  }

  _cloneNodeShallow () {
    const { line, nodeIndex, nestingLevel } = this
    return JSON.parse(JSON.stringify({ line, nodeIndex, nestingLevel }))
  }

  _throwErrorWhenNotSingleNode () {
    if (this.range.to - this.range.from !== 1) {
      throw Error('Xmltr points at many nodes, not a single node')
    }
  }

  _throwErrorWhenNotSingleTagNode () {
    this._throwErrorWhenNotSingleNode()
    if (this.isTextNode()) {
      throw Error('Accessing tag in text node')
    }
  }

  root () {
    return this.nodes[0]
  }

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

  _nodeDescription (node) {
    const current = node || this.nodes[this.range.from]
    if (current.line[0] === '<') {
      return current.line.substr(1, current.line.length - 2)
    }

    return `#text ${current.line}`
  }

  toString () {
    const results = this.nodes.slice(this.range.from, this.range.to).map(node => {
      return `[nodeDescription=[${this._nodeDescription(node)}] nodeIndex=[${node.nodeIndex}] nestingLevel=[${node.nestingLevel}]]`
    })

    return results.length === 1 ? results[0] : results
  }
}

export { Xmltr }
