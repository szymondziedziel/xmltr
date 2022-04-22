class Node {
  constructor (line, nodeIndex = 0, nestingLevel = 0) {
    this.line = line
    this.nodeIndex = nodeIndex
    this.nestingLevel = nestingLevel
    this.nodes = null
  }

  getAttr (name) {
    const { attrValue, attrName } = this.tagNodeArrayDescription(name)

    if (attrValue !== undefined) {
      return attrValue.replaceAll('"', '')
    } else {
      return attrName !== undefined ? true : null
    }
  }

  rmAttr (name) {
    const { tagName, attrIndex, attrs, attrName } = this.tagNodeArrayDescription(name)

    if (attrName !== undefined) {
      delete attrs[attrIndex]
      this.line = `<${tagName} ${attrs.join(' ')}>`
      return true
    }

    return false
  }

  setAttr (name, value) {
    const { tagName, attrIndex, attrs, attr, attrName } = this.tagNodeArrayDescription(name)

    if (attrName !== undefined) {
      attrs[attrIndex] = value !== undefined ? `${name}="${value}"` : name
    } else {
      attrs.push(value !== undefined ? `${attr}="${value}"` : name)
    }

    this.line = `<${tagName} ${attrs.join(' ')}>`
  }

  tagNodeArrayDescription (name) {
    this.throwErrorWhenTextNode()
    const nodeParts = this.nodeDescription().match(/[a-zA-Z0-9-_]+="[^"]+"|[a-zA-Z0-9-_]+/g) || []
    const [tagName, ...attrs] = nodeParts
    const attrIndex = attrs.findIndex(attr => attr.split('=')[0] === name)
    const attr = attrs[attrIndex]
    const [attrName, attrValue] = attr !== undefined
      ? attr.split('=')
      : []

    return { tagName, attrs, attrName, attrValue, attrIndex }
  }

  rm () {
    const { from, length } = this.findNodeRange()
    this.nodes.splice(from, length)
  }

  after (nodes) {
    const { from, length } = this.findNodeRange()
    this.nodes.splice(from + length, 0, nodes)
  }

  before (nodes) {
    const { from, length } = this.findNodeRange()
    this.nodes.splice(from - 1, 0, nodes)
  }

  replace (nodes) {
    const { from, length } = this.findNodeRange()
    this.nodes.splice(from, length, nodes)
  }

  findNodeRange () {
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

  tagName () {
    return this.nodeDescription().split(' ')[0]
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

  toString () {
    return `[nodeDescription=[${this.nodeDescription()}] nodeIndex=[${this.nodeIndex}] nestingLevel=[${this.nestingLevel}]]`
  }

  nodeDescription () {
    if (this.line[0] === '<') {
      return this.line.substr(1, this.line.length - 2)
    }

    return `#text ${this.line}`
  }

  isTagNode () {
    return this.line[0] === '<'
  }

  isTextNode () {
    return this.nodeDescription()[0] === '#'
  }

  throwErrorWhenTextNode () {
    if (this.isTextNode()) {
      throw Error('Accessing tag in text node')
    }
  }
}

class Nodes {
  constructor (data) {
    if (typeof data === 'string') {
      this.nodes = this.parse(data)
    } else if (Array.isArray(data)) {
      this.nodes = data
    } else {
      throw Error('Invalid data passed to Nodes constructor')
    }
  }

  byAttrsVals (filter = []) {
    return this.nodes.filter(node => {
      const nodeParts = node.nodeDescription().match(/[a-zA-Z-_]+="[^"]+"/g) || []
      return (new Set([...filter, ...nodeParts])).size === nodeParts.length
    })
  };

  byTags (tags = []) {
    return this.nodes.filter(node => tags.includes(node.nodeDescription().split(' ')[0]))
  }

  byAttrs (filter = []) {
    return this.nodes.filter(node => {
      const attrs = (node.nodeDescription().match(/[a-zA-Z-_]+="[^"]+"|[a-zA-Z-_]+/g) || []).map(attrVal => attrVal.split('=')[0])
      attrs.shift()
      return (new Set([...filter, ...attrs])).size === attrs.length
    })
  }

  toArrayOfStrings () {
    return this.nodes.map(node => node.toString())
  }

  toString () {
    return `[\n${this.toArrayOfStrings()}\n]`
  }

  extract (xml) {
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

  parse (xml) {
    const lines = this.extract(xml)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let nodeIndex = 0
    let nestingLevel = 0
    const nodes = []

    lines.forEach(line => {
      if (line[line.length - 2] === '/') {
        nodes.push(new Node(line, nodeIndex, nestingLevel))
        nodeIndex++
      } else if (line[1] === '/') {
        nestingLevel--
      } else {
        nodes.push(new Node(line, nodeIndex, nestingLevel))
        if (line[0] === '<') {
          nestingLevel++
        }
        nodeIndex++
      }
    })

    nodes.forEach(node => { node.nodes = nodes })

    return nodes
  }
}

export { Node, Nodes }
