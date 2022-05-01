# xmltr

## Overview

Another xml parser. Working on it for just pure fun.

At final stage I want to be able to do some obvious operations:

- read xml file:
  - accept opening tags :white_check_mark:
  - accept closing tags (no validation it tagg properly closed) :white_check_mark:
  - accept self closing tags :white_check_mark:
  - accept text nodes :white_check_mark:
  - accept comments
- write xml file
  - minified
  - formatted
- be able to find:
  - by tag names :white_check_mark:
  - by attributes :white_check_mark:
  - by attributes with values :white_check_mark:
  - CSS selectors
  - maybe XPATH
- be able to read/ update node
  - read node tag name  :white_check_mark:
  - read attribute value  :white_check_mark:
  - add new attribute :white_check_mark:
  - add multivalue attribute  :white_check_mark:
  - update existing attribute :white_check_mark:
  - update multivalue attribute :white_check_mark:
  - remove existing attribute :white_check_mark:
  - remove multivalue attribute/ remove all :white_check_mark:
  - to use boolean as attr="value" attributes :white_check_mark:
- be able to change/ travel
  - through children any depth :white_check_mark:
  - to parent :white_check_mark:
  - to next/ previous sibling :white_check_mark:
  - simple subsearching :white_check_mark:
- be able to change structue
  - insert node after/ before current :white_check_mark:
  - replace node :white_check_mark:
  - remove node :white_check_mark:
- and more
  - clone nodes

## Challenges

- use only one dimensional flat array of {line, index, depth}
- do the rest with some smart operations on that array
- try to keep library as small as possible
- never did full TDD, so I will give it a try
- use only dev dependencies

## Let's try then

Some already supported API. Maybe in the future I will use some jsdoc

```
class Xmltr
  constructor (data, range, parentObjects) // pass xml as data so it will be parsed for you
  static fromNode (xmltr, node) // used mostly internally, no need to use it
  getAttr (...names)
  getMultiAttr (...names)
  rmAttr (...names)
  rmMultiAttr (...names)
  setAttr (name, value)
  setMultiAttr (name, values = [])
  byTags (...tags)
  byAttrs (...filters)
  byAttrsVals (...filters)
  rm ()
  after (node)
  before (node)
  replace (node)
  insertChild (node, index = -1)
  tagName ()
  parent ()
  previous ()
  next ()
  children ()
  isTagNode ()
  isTextNode ()
  selfRange () // used mostly internally, no need to use it
  toString ()
  selfShallow () // used mostly internally, no need to use it
  selfDeep () // used mostly internally, no need to use it
```
