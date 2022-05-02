class NoAttributeNameProvided extends Error {
  constructor (message) {
    super(message)
    this.name = 'NoAttributeNameProvided'
  }
}

class WrongAttributeNameTypeProvided extends Error {
  constructor (message) {
    super(message)
    this.name = 'WrongAttributeNameTypeProvided'
  }
}

class InvalidDataPassedToConstructor extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidDataPassedToConstructor'
  }
}

class Xmltr {
  constructor (data, id) {
    if (typeof data === 'string') {
      this.nodes = this._parse(data)
    } else if (Array.isArray(data)) {
      this.nodes = data
    } else {
      throw new InvalidDataPassedToConstructor('Invalid data passed to Nodes constructor')
    }
    this.id = id || this.nodes[0].id
  }

  static fromNode (xmltr, node) {
    return new Xmltr(xmltr.nodes, node.id)
  }

  getAttr (...names) {
    this._throwError1('Xmltr', 'getAttr', ...names)
    const values = names.map(name => this._tagNodeArrayDescription(name).first.attrValue)
    return values.length > 1 ? values : values[0]
  }

  getMultiAttr (...names) {
    this._throwError1('Xmltr', 'getMultiAttr', ...names)
    const nameValues = names
      .map(name =>
        this._tagNodeArrayDescription(name).all.attrsValues.map(attrValue => attrValue[1])
      )
      .map(nameValues => nameValues.filter(nameValue => nameValue !== undefined))

    return nameValues.length > 1 ? nameValues : nameValues[0]
  }

  rmAttr (...names) {
    this._throwError1('Xmltr', 'rmAttr', ...names)
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
    this._throwError1('Xmltr', 'rmMultiAttr', ...names)
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

  byTags (...tags) {
    return this.selfDeep()
      .filter(node => tags.includes(Xmltr.fromNode(this, node).tagName()))
      .map(node => Xmltr.fromNode(this, node))
  }

  byAttrs (...filters) {
    return this.selfDeep()
      .filter(node => filters.map(f => node.line.indexOf(` ${f}`) > 0).find(e => e === true))
      .map(node => Xmltr.fromNode(this, node))
  }

  byAttrsVals (...filters) {
    return this.selfDeep()
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
      value = value !== undefined ? value.substring(0, value.length - 1) : undefined
      result[name] = value
      return result
    }, {})

    return { tagName, attrs }
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
    const { from, length } = this.selfRange()
    const currentNestingLevel = this.nodes[from].depth
    this._substituteFromLength(node, from + length, 0, currentNestingLevel)
  }

  before (node) {
    const { from } = this.selfRange()
    const currentNestingLevel = this.nodes[from].depth
    this._substituteFromLength(node, from, 0, currentNestingLevel)
  }

  replace (node) {
    const { from, length } = this.selfRange()
    const currentNestingLevel = this.nodes[from].depth
    this._substituteFromLength(node, from, length, currentNestingLevel)
  }

  insertChild (node, atIndex = -1) {
    atIndex = atIndex === -1 ? this.children().length : atIndex
    const current = this.selfShallow()
    const { index, depth } = current
    this.nodes.splice(index + atIndex + 1, 0, ...node.nodes)
    node.nodes.forEach(node => {
      node.depth += depth + 1
    })
    this.range = this.selfRange()
    this._renumber()
  }

  _substituteFromLength (node, from, length, currentNestingLevel) {
    node.nodes.forEach((node, index) => {
      node.depth = node.depth + currentNestingLevel
    })
    this.nodes.splice(from, length, ...node.nodes)
    this._renumber()
  }

  _renumber () {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].index = i
    }
  }

  tagName () {
    return this._tagDesc().tagName
  }

  parent () {
    const { index, depth } = this.selfShallow()
    for (let i = index; i > -1; i--) {
      if (this.nodes[i].depth === depth - 1) {
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
      .findIndex(child => child.id === this.id)
    return children[currentChildIndex - 1]
  }

  next () {
    const parent = this.parent()
    if (!parent) { return null }
    const children = parent.children()
    const currentChildIndex = children
      .findIndex(child => child.id === this.id)
    return children[currentChildIndex + 1]
  }

  children () {
    const { depth } = this.selfShallow()
    return this.selfDeep()
      .filter(node => node.depth === depth + 1)
      .map(node => Xmltr.fromNode(this, node))
  }

  isTagNode () {
    return this.line[0] === '<'
  }

  isTextNode () {
    return this._nodeDescription()[0] === '#'
  }

  _throwErrorWhenNotSingleNode () {
    return
    if (this.range.to - this.range.from !== 1) {
      throw new Error('Xmltr points at many nodes, not a single node')
    }
  }

  _throwErrorWhenNotSingleTagNode () {
    return
    this._throwErrorWhenNotSingleNode()
    if (this.isTextNode()) {
      throw new Error('Accessing tag in text node')
    }
  }

  _extract (xml) {
    return xml.replaceAll('<', '&xmltr;<').replaceAll('>', '>&xmltr;').split('&xmltr;')
  }

  _parse (xml) {
    const lines = this._extract(xml)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let index = 0
    let depth = 0
    const nodes = []

    lines.forEach(line => {
      const id = `${process.hrtime.bigint()}-${[0, 0, 0, 0].map(n => '0123456789abcdef'.split('')[Math.floor(Math.random() * (16))]).join('')}`
      if (line[line.length - 2] === '/') {
        nodes.push({ line, index, depth, id })
        index++
      } else if (line[1] === '/') {
        depth--
      } else {
        nodes.push({ line, index, depth, id })
        if (line[0] === '<') {
          depth++
        }
        index++
      }
    })

    nodes.forEach(node => { node.nodes = nodes })

    return nodes
  }

  _nodeDescription () {
    const line = this.selfShallow().line
    return line[0] === '<' ? line.substr(1, line.length - 2) : `#text ${line}`
  }

  reprShallow () {
    const { from } = this.selfRange()
    const node = this.nodes[from]
    return `[nodeDescription=[${Xmltr.fromNode(this, node)._nodeDescription()}] index=[${node.index}] depth=[${node.depth}]]`
  }

  reprDeep () {
    const { from, to } = this.selfRange()
    const results = this.nodes.slice(from, to).map(node => {
      return `[nodeDescription=[${Xmltr.fromNode(this, node)._nodeDescription()}] index=[${node.index}] depth=[${node.depth}]]`
    })

    return results.length === 1 ? results[0] : results
  }

  toStringDebug () {
    const { from, to } = this.selfRange()
    const results = this.nodes.slice(from, to).map(node => {
      return `[nodeDescription=[${Xmltr.fromNode(this, node)._nodeDescription()}] index=[${node.index}] depth=[${node.depth}] t=[${node.t}]]`
    })

    return results.length === 1 ? results[0] : results
  }

  selfDeep () {
    const { from, length } = this.selfRange()
    return this.nodes.slice(from, from + length)
  }

  selfShallow () {
    return this.nodes.find(node => node.id === this.id)
  }

  selfRange () {
    const current = this.nodes.find(node => node.id === this.id)
    const from = current !== undefined ? current.index : 0
    let length = current !== undefined ? 1 : 0
    for (let i = from + 1; i < this.nodes.length; i++) {
      if (this.nodes[i].depth > this.selfShallow().depth) {
        length++
      } else {
        break
      }
    }
    return { from, length }
  }

  _throwError1 (className, methodName, ...args) {
    if (args.length < 1) {
      throw new NoAttributeNameProvided(`${className}::${methodName} requires at least one attribute names`)
    }
    if (args.map(name => typeof name === 'string').includes(false)) {
      throw new WrongAttributeNameTypeProvided(`${className}::${methodName} requires all names to be strings.`)
    }
  }
}

Xmltr.Errors = {
  NoAttributeNameProvided,
  WrongAttributeNameTypeProvided,
  InvalidDataPassedToConstructor
}

export { Xmltr }
