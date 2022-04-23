# xmltr

## Overview

Another xml parser. Working on it for just pure fun.

At final stage I want to be able to do some obvious operations:

- read xml file:
  - accept opening tags
  - accept closing tags (no validation it tagg properly closed)
  - accept self closing tags
  - accept text nodes
- be able to find:
  - by tag names
  - by attributes
  - by attributes with values
- be able to read/ update node
  - read node tag name
  - read attribute value
  - add new attribute
  - update existing attribute
  - remove existing attribute
  - be able to use boolean as attr="value" attributes
- be able to change travel
  - through children any depth
  - to parent
  - to next/ previous sibling
- be able to change structue
  - insert node after/ before current
  - replace node
  - remove node
- and more
  - clone nodes

## Challenges

- use only one dimensional flat array of strings
- do the rest with some smart operations on that array
- try to keep library as small as possible
- never did full TDD, so I will give it a try
- use only dev dependencies

## Let's try then

Some already supported API. Maybe in the future I will use some jsdoc

```
class Node
  constructor (line, nodeIndex = 0, nestingLevel = 0)
  getAttr (name)
  rmAttr (name)
  setAttr (name, value)
  rm ()
  tagName ()
  parent ()
  children ()
  toString ()
  isTagNode ()
  isTextNode ()
class Nodes
  constructor (data)
  byAttrsVals (filter = [])
  byTags (tags = [])
  byAttrs (filter = [])
```
