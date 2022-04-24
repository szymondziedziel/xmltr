import assert from 'assert'
import { Node, Nodes } from '../xmltr.mjs'

const SAMPLE_XML = '<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>'

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
  })

  describe('Allow different tag names', function () {
    it('Should have single word tag name', function () {
      assert.equal(
        (new Node('<p>', 0, 0)).tagName(),
        'p'
      )
    })

    it('Should have single capitalised word tag name', function () {
      assert.equal(
        (new Node('<Single>', 0, 0)).tagName(),
        'Single'
      )
    })

    it('Should have single const-like-uppercase word tag name', function () {
      assert.equal(
        (new Node('<UPPER>', 0, 0)).tagName(),
        'UPPER'
      )
    })

    it('Should have double word kebab-case tag name', function () {
      assert.equal(
        (new Node('<simple-action>', 0, 0)).tagName(),
        'simple-action'
      )
    })

    it('Should have double word sneak-case tag name', function () {
      assert.equal(
        (new Node('<simple_action>', 0, 0)).tagName(),
        'simple_action'
      )
    })

    it('Should have four-word camel-case tag name', function () {
      assert.equal(
        (new Node('<someLongerTagName>', 0, 0)).tagName(),
        'someLongerTagName'
      )
    })

    it('Should have four-word const-like-upprecase tag name', function () {
      assert.equal(
        (new Node('<SOME_LONGER_TAG_NAME>', 0, 0)).tagName(),
        'SOME_LONGER_TAG_NAME'
      )
    })

    it('Should allow numbers in tag name', function () {
      assert.equal(
        (new Node('<build-variant-1>', 0, 0)).tagName(),
        'build-variant-1'
      )
    })

    it('Should have mixed tag name', function () {
      assert.equal(
        (new Node('<_private_URLBuilder_Factory>', 0, 0)).tagName(),
        '_private_URLBuilder_Factory'
      )
    })
  })

  describe('Getting attributes by names in error prone way', function () {
    it('Should have proper one word non-boolean attribute value', function () {
      assert.equal(
        (new Node('<simple-action enabled="true">')).getAttr('enabled'),
        'true'
      )
    })

    it('Should have proper double word attribute value', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr('long-clickable'),
        'true'
      )
    })

    it('Should not return attribute value when trying to get attribute which name is part of/ similar to the longer one', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr('clickable'),
        null
      )
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr('long'),
        null
      )
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr('-'),
        null
      )
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr(' long-clickable'),
        null
      )
    })

    it('Should have proper null attribute value when no attribute defined within tag', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true">')).getAttr('any'),
        null
      )
    })

    it('Should give true of boolean type when boolean attribute given', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true" disabled>')).getAttr('disabled'),
        true
      )
    })

    it('Should give null when read boolean attribute which is tag name', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true" disabled>')).getAttr('simple-action'),
        null
      )
    })

    it('Should give value when read boolean attribute which is tag name and also is defined withing tag', function () {
      assert.equal(
        (new Node('<simple-action long-clickable="true" simple-action disabled>')).getAttr('simple-action'),
        true
      )
    })
  })

  describe('Getting all attributes from single tag', function () {
    it('Should get proper attribute value', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.getAttr('attr1'), 'value1')
      assert.equal(node.getAttr('attr2'), 'value2')
      assert.equal(node.getAttr('boolattr1'), true)
      assert.equal(node.getAttr('non-existing-attribute'), null)
    })
  })

  describe('Removing all attributes from single tag', function () {
    it('Should remove proper attribute value', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.rmAttr('attr1'), true)
      assert.equal(node.getAttr('attr1'), null)
      assert.equal(node.rmAttr('attr2'), true)
      assert.equal(node.getAttr('attr2'), null)
      assert.equal(node.rmAttr('boolattr1'), true)
      assert.equal(node.getAttr('boolattr1'), null)
      assert.equal(node.rmAttr('non-existing-attr'), false)
    })
  })

  describe('Setting/ updating all attributes from single tag', function () {
    it('Should set|update proper attribute value', function () {
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

  describe('Getting multivalue attribute', function () {
    it('When no attributes with specified name', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.deepEqual(node.getMultiAttr('attr1'), [])
    })

    it('When only one attribute sith specified name. Should return single element array', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1'])
    })

    it('When more attributes with specified name. Should get them all as array', function () {
      const node = new Node('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2" attr1="value1.3" boolattr1 attr1="value1.4">', 0, 0)
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1', 'value1.2', 'value1.3', 'value.1.4'])
    })
  })

  describe('Removing multivalue attribute', function () {
    it('When no attributes with specified name', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.rmMultiAttr('attr1'), 0)
    })

    it('When only one attribute sith specified name. Should return single element array', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      assert.equal(node.rmMultiAttr('attr1'), 1)
    })

    it('When more attributes with specified name. Should get them all as array', function () {
      const node = new Node('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2" attr1="value1.3" boolattr1 attr1="value1.4">', 0, 0)
      assert.equal(node.rmMultiAttr('attr1'), 4)
    })
  })

  describe('Setting multivalue attribute', function () {
    it('When no values provided', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      node.setMultiAttr('attr1', [])
      assert.deepEqual(node.getMultiAttr('attr1'), [])
    })

    it('When only one value provided. Should return single element array', function () {
      const node = new Node('<some-tag attr1="value1" attr2="value2" boolattr1>', 0, 0)
      node.setMultiAttr('attr1', ['attr1.1'])
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1'])
    })

    it('When more values provided. Should get them all as array', function () {
      const node = new Node('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2" attr1="value1.3" boolattr1 attr1="value1.4">', 0, 0)
      node.setMultiAttr('attr1', ['value1.1', 'value1.2', 'value1.3', 'value1.4'])
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1', 'value1.2', 'value1.3', 'value.1.4'])
    })
  })

  describe('Getting children', function () {
    const tree = new Nodes(SAMPLE_XML)
    const student = tree.byTags
    assert.deepEqual(
      tree.root().children().map(node => node.toString()),
      [
        '[nodeDescription=[student] nodeIndex=[1] nestingLevel=[1]]'
      ]
    )
  })

  describe('Getting children', function () {
    const tree = new Nodes(SAMPLE_XML)
    const student = tree.byTags
    assert.deepEqual(
      tree.root().children()[0].toString(),
      '[nodeDescription=[student] nodeIndex=[1] nestingLevel=[1]]'
    )
  })
})
