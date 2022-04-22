import assert from 'assert'
import { Node } from '../xmltr.mjs'

describe('Node', function () {
  describe('Constructing object', function () {
    it('Should create appropriate object', function () {
      assert.equal(
        (new Node('<a>')).toString(),
        '[nodeDescription=[a] nodeIndex=[0] nestingLevel=[0]]'
      )
      assert.equal(
        (new Node('<a>', 0)).toString(),
        '[nodeDescription=[a] nodeIndex=[0] nestingLevel=[0]]'
      )
      assert.equal(
        (new Node('<a>', 0, 0)).toString(),
        '[nodeDescription=[a] nodeIndex=[0] nestingLevel=[0]]'
      )
    })

    it('Should have single word tagName name', function () {
      assert.equal(
        (new Node('<test>', 0, 0)).tagName(),
        'test'
      )
    })

    it('Should have double word tagName name', function () {
      assert.equal(
        (new Node('<simple-action>', 0, 0)).tagName(),
        'simple-action'
      )
    })
  })

  describe('Getting various attributes', function () {
    it('Should have proper one word attribute value', function () {
      assert.equal(
        (new Node('<simple-action enabled="true">', 0, 0)).getAttr('enabled'),
        'true'
      )
    })

    it('Should have proper double word attribute value', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true">', 0, 0)).getAttr('long-clickable'),
        'true'
      )
    })

    it('Should have proper null attribute value', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true">', 0, 0)).getAttr('any'),
        null
      )
    })

    it('Should have give true when boolean attribute given', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true" disabled>', 0, 0)).getAttr('disabled'),
        true
      )
    })

    it('Should have give false when boolean attribute is same as tagName', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true" disabled>', 0, 0)).getAttr('simple-action'),
        null
      )
    })
  })

  describe('Usage of {get|set|remove}Attr functions', function () {
    it('Should get proper attr value', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.getAttr('attr1'), 'value1')
      assert.equal(node.getAttr('attr2'), 'value2')
      assert.equal(node.getAttr('boolattr1'), true)
      assert.equal(node.getAttr('non-existing-attr'), null)
    })

    it('Should remove proper attr value', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.rmAttr('attr1'), true)
      assert.equal(node.getAttr('attr1'), null)
      assert.equal(node.rmAttr('attr2'), true)
      assert.equal(node.getAttr('attr2'), null)
      assert.equal(node.rmAttr('boolattr1'), true)
      assert.equal(node.getAttr('boolattr1'), null)
      assert.equal(node.rmAttr('non-existing-attr'), false)
    })

    it('Should set|update proper attr value', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      node.setAttr('attr1', 'newValue1')
      assert.equal(node.getAttr('attr1'), 'newValue1')
      node.setAttr('attr2', 'newValue2')
      assert.equal(node.getAttr('attr2'), 'newValue2')
      node.setAttr('boolattr1', 'false')
      assert.equal(node.getAttr('boolattr1'), 'false')
      node.setAttr('boolattr2')
      assert.equal(node.getAttr('boolattr2'), true)
    })
  })
})
