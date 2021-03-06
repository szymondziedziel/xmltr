import assert from 'assert'
import { Xmltr } from '../xmltr.mjs'

const SAMPLE_XML = '<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>'
const SAMPLE_XML_2 = '<shop><shop-cart items="3"><item name="1" /><item name="2" /><item name="3" /></shop-cart></shop>'

describe('Xmltr', function () {
  describe('Constructing object', function () {
    it('Should create appropriate object', function () {
      assert.equal(
        (new Xmltr('<a>')).reprDeep(),
        '[nodeDescription=[a] index=[0] depth=[0]]'
      )
      assert.equal(
        (new Xmltr('<a>', 0)).reprDeep(),
        '[nodeDescription=[a] index=[0] depth=[0]]'
      )
      assert.equal(
        (new Xmltr('<a>')).reprDeep(),
        '[nodeDescription=[a] index=[0] depth=[0]]'
      )
    })
  })

  describe('Basic functions (helpers/ private)', function () {

    it('Self range is only a helper and it should return range from, length occupied within all nodes', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.deepEqual(tree.selfRange(), { from: 0, length: 6 })
    })

    it('Self deep is only a helper and it should return self with all descentants', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.equal(tree.selfDeep().length, 6)

      assert.deepEqual(
        tree.selfDeep().map(node => Xmltr.fromNode(tree, node).reprShallow()),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[last-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[5] depth=[3]]'
        ]
      )

    })

    it('Self shallow is only a helper and it should return single raw node object', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('last-name')[0]
      assert.equal(
        tree.reprShallow(),
        '[nodeDescription=[persons] index=[0] depth=[0]]'
      )
      assert.equal(
        lastName.reprShallow(),
        '[nodeDescription=[last-name] index=[4] depth=[2]]'
      )
    })
  })

  describe('Allow different tag names', function () {
    it('Should have single word tag name', function () {
      assert.equal(
        (new Xmltr('<p>')).tagName(),
        'p'
      )
    })

    it('Should have single capitalised word tag name', function () {
      assert.equal(
        (new Xmltr('<Single>')).tagName(),
        'Single'
      )
    })

    it('Should have single const-like-uppercase word tag name', function () {
      assert.equal(
        (new Xmltr('<UPPER>')).tagName(),
        'UPPER'
      )
    })

    it('Should have double word kebab-case tag name', function () {
      assert.equal(
        (new Xmltr('<simple-action>')).tagName(),
        'simple-action'
      )
    })

    it('Should have double word sneak-case tag name', function () {
      assert.equal(
        (new Xmltr('<simple_action>')).tagName(),
        'simple_action'
      )
    })

    it('Should have four-word camel-case tag name', function () {
      assert.equal(
        (new Xmltr('<someLongerTagName>')).tagName(),
        'someLongerTagName'
      )
    })

    it('Should have four-word const-like-upprecase tag name', function () {
      assert.equal(
        (new Xmltr('<SOME_LONGER_TAG_NAME>')).tagName(),
        'SOME_LONGER_TAG_NAME'
      )
    })

    it('Should allow numbers in tag name', function () {
      assert.equal(
        (new Xmltr('<build-variant-1>')).tagName(),
        'build-variant-1'
      )
    })

    it('Should have mixed tag name', function () {
      assert.equal(
        (new Xmltr('<_private_URLBuilder_Factory>')).tagName(),
        '_private_URLBuilder_Factory'
      )
    })
  })

  describe('Getting attributes by names in error prone way', function () {
    it('Should have proper one word non-boolean attribute value', function () {
      assert.equal(
        (new Xmltr('<simple-action enabled="true">')).getAttr('enabled'),
        'true'
      )
    })

    it('Should have proper double word attribute value', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr('long-clickable'),
        'true'
      )
    })

    it('Should not return attribute value when trying to get attribute which name is part of/ similar to the longer one', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr('clickable'),
        null
      )
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr('long'),
        null
      )
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr('-'),
        null
      )
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr(' long-clickable'),
        null
      )
    })

    it('Should have proper null attribute value when no attribute defined within tag', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true">')).getAttr('any'),
        null
      )
    })

    it('Should give true of boolean type when boolean attribute given', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true" disabled>')).getAttr('disabled'),
        true
      )
    })

    it('Should give null when read boolean attribute which is tag name', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true" disabled>')).getAttr('simple-action'),
        null
      )
    })

    it('Should give value when read boolean attribute which is tag name and also is defined withing tag', function () {
      assert.equal(
        (new Xmltr('<simple-action long-clickable="true" simple-action disabled>')).getAttr('simple-action'),
        true
      )
    })
  })

  describe('Getting all attributes from single tag', function () {
    it('Should get proper attribute value', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.equal(node.getAttr('attr1'), 'value1')
      assert.equal(node.getAttr('attr2'), 'value2')
      assert.equal(node.getAttr('boolattr1'), true)
      assert.equal(node.getAttr('non-existing-attribute'), null)
    })
  })

  describe('Getting more attributes from single tag', function () {
    it('Should get proper attribute value', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.deepEqual(node.getAttr('attr1', 'attr2'), ['value1', 'value2'])
    })
  })

  describe('Removing all attributes in one call from single tag', function () {
    it('Should remove proper attribute value', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.equal(node.rmAttr('attr1'), true)
      assert.equal(node.getAttr('attr1'), null)
      assert.equal(node.rmAttr('attr2'), true)
      assert.equal(node.getAttr('attr2'), null)
      assert.equal(node.rmAttr('boolattr1'), true)
      assert.equal(node.getAttr('boolattr1'), null)
      assert.equal(node.rmAttr('non-existing-attr'), false)
    })
  })

  describe('Removing more attributes in one call fomr single tag', function () {
    it('Should remove proper attribute value', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.deepEqual(node.rmAttr('attr1', 'attr2', 'boolattr1', 'non-existing-attr'), [true, true, true, false])
      assert.equal(node.getAttr('attr1'), null)
      assert.equal(node.getAttr('attr2'), null)
      assert.equal(node.getAttr('boolattr1'), null)
    })
  })

  describe('Setting/ updating all attributes from single tag', function () {
    it('Should set|update proper attribute value', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
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
      const node = new Xmltr('<some-tag attr2="value2" boolattr1>')
      assert.deepEqual(node.getMultiAttr('attr1'), [])
    })

    it('When only one attribute with specified name. Should return single element array', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1'])
    })

    it('When more attributes with specified name. Should get them all as array', function () {
      const node = new Xmltr('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2" attr1="value1.3" boolattr1 attr1="value1.4">')
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1', 'value1.2', 'value1.3', 'value1.4'])
    })
  })

  describe('Getting multivalue attributes', function () {
    it('When two attributes given two times', function () {
      const node = new Xmltr('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2.1" attr2="value2.2" boolattr1>')
      assert.deepEqual(node.getMultiAttr('attr1', 'attr2'), [['value1.1', 'value1.2'], ['value2.1', 'value2.2']])
    })
  })

  describe('Removing multivalue attribute', function () {
    it('When no attributes with specified name', function () {
      const node = new Xmltr('<some-tag attr2="value2" boolattr1>')
      assert.equal(node.rmMultiAttr('attr1'), 0)
    })

    it('When only one attribute with specified name. Should return removed count', function () {
      const node = new Xmltr('<some-tag attr1="value1" attr2="value2" boolattr1>')
      assert.equal(node.rmMultiAttr('attr1'), 1)
    })

    it('When more attributes with specified name. Should return removed count', function () {
      const node = new Xmltr('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2" attr1="value1.3" boolattr1 attr1="value1.4">')
      assert.equal(node.rmMultiAttr('attr1'), 4)
    })
  })

  describe('Removing multivalue attributes', function () {
    it('When two attributes given two times', function () {
      const node = new Xmltr('<some-tag attr1="value1.1" attr1="value1.2" attr2="value2.1" attr2="value2.2" boolattr1>')
      assert.deepEqual(node.rmMultiAttr('attr1', 'attr2'), [2, 2])
    })
  })

  describe('Setting multivalue attribute', function () {
    it('When no values provided', function () {
      const node = new Xmltr('<some-tag attr2="value2" boolattr1>')
      node.setMultiAttr('attr1', [])
      assert.deepEqual(node.getMultiAttr('attr1'), [])
    })

    it('When only one value provided. Should return single element array', function () {
      const node = new Xmltr('<some-tag attr2="value2" boolattr1>')
      node.setMultiAttr('attr1', ['value1.1'])
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1'])
    })

    it('When more values provided. Should get them all as array', function () {
      const node = new Xmltr('<some-tag attr2="value2" boolattr1>')
      node.setMultiAttr('attr1', ['value1.1', 'value1.2', 'value1.3', 'value1.4'])
      assert.deepEqual(node.getMultiAttr('attr1'), ['value1.1', 'value1.2', 'value1.3', 'value1.4'])
    })

    it('When more values provided to tag which aldready has some attribute with same name. Should get them all as array', function () {
      const node = new Xmltr('<some-tag attr1="a" attr1="b" attr2="value2" attr1 boolattr1 attr1="1">')
      node.setMultiAttr('attr1', ['value1.1', 'value1.2', 'value1.3', 'value1.4'])
      assert.deepEqual(node.getMultiAttr('attr1'), ['a', 'b', true, '1', 'value1.1', 'value1.2', 'value1.3', 'value1.4'])
    })
  })

  describe('Getting children', function () {
    it('Getting children', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.deepEqual(
        tree.children().map(node => node.reprShallow()),
        [
          '[nodeDescription=[student] index=[1] depth=[1]]'
        ]
      )
    })

    it('Getting children 2', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.deepEqual(
        tree.children()[0].children().map(node => node.reprShallow()),
        [
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[last-name] index=[4] depth=[2]]'
        ]
      )
    })

    it('Getting children text node', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.deepEqual(
        tree.children()[0].children()[0].children().map(node => node.reprShallow()),
        [
          '[nodeDescription=[#text John] index=[3] depth=[3]]'
        ]
      )
    })
  })

  describe('Traveling to parent, previous and next', function () {
    it('Root has no parent', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.equal(tree.parent(), null)
    })

    it('Root has no previous', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.equal(tree.previous(), null)
    })

    it('Root has no next', function () {
      const tree = new Xmltr(SAMPLE_XML)
      assert.equal(tree.next(), null)
    })

    it('Student\'s children have Student node as parent', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const student = tree.byTags('student')[0]
      assert.equal(
        student.children()[0].parent().reprShallow(),
        '[nodeDescription=[student] index=[1] depth=[1]]'
      )
      assert.equal(
        student.children()[1].parent().reprShallow(),
        '[nodeDescription=[student] index=[1] depth=[1]]'
      )
    })

    it('first-name has last-name as next', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].children()[0]
      assert.equal(
        firstName.next().reprShallow(),
        '[nodeDescription=[last-name] index=[4] depth=[2]]'
      )
    })

    it('last-name has first-name as previous', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('student')[0].children()[1]
      assert.equal(
        lastName.previous().reprShallow(),
        '[nodeDescription=[first-name] index=[2] depth=[2]]'
      )
    })
  })

  describe('Subsearches', function () {
    it('Find student then find last-name', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('student')[0].byTags('last-name')[0]
      assert.equal(
        lastName.reprShallow(),
        '[nodeDescription=[last-name] index=[4] depth=[2]]'
      )
    })

    it('Find items by attrVal then item by attrVal', function () {
      const tree = new Xmltr(SAMPLE_XML_2)
      const item1 = tree.byAttrsVals('items="3"')[0].byAttrsVals('name="1"')[0]
      assert.equal(
        item1.reprShallow(),
        '[nodeDescription=[item name="1" /] index=[2] depth=[2]]'
      )
    })

    it('Find items by attr then item by attr', function () {
      const tree = new Xmltr(SAMPLE_XML_2)
      const item1 = tree.byAttrs('items')[0].byAttrs('name')[0]
      assert.equal(
        item1.reprShallow(),
        '[nodeDescription=[item name="1" /] index=[2] depth=[2]]'
      )
    })

    it('Find items by tag name then item by attr', function () {
      const tree = new Xmltr(SAMPLE_XML_2)
      const item1 = tree.byTags('shop-cart')[0].byAttrs('name')[2]
      assert.equal(
        item1.reprShallow(),
        '[nodeDescription=[item name="3" /] index=[4] depth=[2]]'
      )
    })
  })

  describe('Removing node from tree', function () {
    it('Remove Root', function () {
      const tree = new Xmltr(SAMPLE_XML)
      tree.rm()
      assert.deepEqual(
        tree.reprDeep(),
        []
      )
    })

    it('Remove last-name', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('student')[0].byTags('last-name')[0]
      lastName.rm()
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]'
        ]
      )
    })

    it('Remove first-name and last-name', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0]
      firstName.rm()
      const lastName = tree.byTags('student')[0].byTags('last-name')[0]
      lastName.rm()
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
        ]
      )
    })
  })

  describe('Replacing node in tree', function () {
    it('Replace first-name with node', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0].children()[0]
      const newFirstName = (new Xmltr('Rick'))
      firstName.replace(newFirstName)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text Rick] index=[3] depth=[3]]',
          '[nodeDescription=[last-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[5] depth=[3]]'
        ]
      )
    })

    it('Replace first-name with tree', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0]
      const newFirstName = (new Xmltr('<first-name>Rick</first-name>'))
      firstName.replace(newFirstName)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text Rick] index=[3] depth=[3]]',
          '[nodeDescription=[last-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[5] depth=[3]]'
        ]
      )
    })

    it('Replace student with node', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const student = tree.byTags('student')[0]
      const anything = (new Xmltr('Test'))
      student.replace(anything)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[#text Test] index=[1] depth=[1]]'
        ]
      )
    })
  })

  describe('Interting after node in tree', function () {
    it('Insert middle-name after first-name with tree', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0]
      const middleName = new Xmltr('<middle-name>Aron</middle-name>')
      firstName.after(middleName)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[middle-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Aron] index=[5] depth=[3]]',
          '[nodeDescription=[last-name] index=[6] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[7] depth=[3]]'
        ]
      )
    })

    it('Insert middle-name tag after first-name with node', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0]
      const middleNameTag = (new Xmltr('<middle-name>'))
      firstName.after(middleNameTag)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[middle-name] index=[4] depth=[2]]',
          '[nodeDescription=[last-name] index=[5] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[6] depth=[3]]'
        ]
      )
    })

    it('Insert middle-name tag after first-name with two node (using here insertChild)', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const firstName = tree.byTags('student')[0].byTags('first-name')[0]
      const middleNameTag = (new Xmltr('<middle-name>'))
      const middleNameText = (new Xmltr('Aron'))
      middleNameTag.insertChild(middleNameText)
      firstName.after(middleNameTag)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[middle-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Aron] index=[5] depth=[3]]',
          '[nodeDescription=[last-name] index=[6] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[7] depth=[3]]'
        ]
      )
    })
  })

  describe('Interting before node in tree', function () {
    it('Insert middle-name before last-name with tree', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('student')[0].byTags('last-name')[0]
      const middleName = (new Xmltr('<middle-name>Aron</middle-name>'))
      lastName.before(middleName)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[middle-name] index=[4] depth=[2]]',
          '[nodeDescription=[#text Aron] index=[5] depth=[3]]',
          '[nodeDescription=[last-name] index=[6] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[7] depth=[3]]'
        ]
      )
    })

    it('Insert middle-name tag before last-name with node', function () {
      const tree = new Xmltr(SAMPLE_XML)
      const lastName = tree.byTags('student')[0].byTags('last-name')[0]
      const middleNameTag = (new Xmltr('<middle-name>'))
      lastName.before(middleNameTag)
      assert.deepEqual(
        tree.reprDeep(),
        [
          '[nodeDescription=[persons] index=[0] depth=[0]]',
          '[nodeDescription=[student] index=[1] depth=[1]]',
          '[nodeDescription=[first-name] index=[2] depth=[2]]',
          '[nodeDescription=[#text John] index=[3] depth=[3]]',
          '[nodeDescription=[middle-name] index=[4] depth=[2]]',
          '[nodeDescription=[last-name] index=[5] depth=[2]]',
          '[nodeDescription=[#text Doe] index=[6] depth=[3]]'
        ]
      )
    })
  })

  describe('Inserting children', function () {
    it('Create node and add child', function () {
      const tag = new Xmltr('<tag>')
      const tagContent = new Xmltr('tag content')
      tag.insertChild(tagContent)
      assert.deepEqual(
        tag.reprDeep(),
        [
          '[nodeDescription=[tag] index=[0] depth=[0]]',
          '[nodeDescription=[#text tag content] index=[1] depth=[1]]'
        ]
      )
    })

    it('Create node and add three children', function () {
      const parent = new Xmltr('<parent>')
      const child1 = new Xmltr('<child1>')
      const child2 = new Xmltr('<child2>')
      const child3 = new Xmltr('<child3>')
      parent.insertChild(child1)
      parent.insertChild(child2)
      parent.insertChild(child3)
      assert.deepEqual(
        parent.reprDeep(),
        [
          '[nodeDescription=[parent] index=[0] depth=[0]]',
          '[nodeDescription=[child1] index=[1] depth=[1]]',
          '[nodeDescription=[child2] index=[2] depth=[1]]',
          '[nodeDescription=[child3] index=[3] depth=[1]]'
        ]
      )
    })

    it('Create node and add three children but in different order', function () {
      const parent = new Xmltr('<parent>')
      const child1 = new Xmltr('<child1>')
      const child2 = new Xmltr('<child2>')
      const child3 = new Xmltr('<child3>')
      parent.insertChild(child1)
      parent.insertChild(child3)
      parent.insertChild(child2)
      assert.deepEqual(
        parent.reprDeep(),
        [
          '[nodeDescription=[parent] index=[0] depth=[0]]',
          '[nodeDescription=[child1] index=[1] depth=[1]]',
          '[nodeDescription=[child3] index=[2] depth=[1]]',
          '[nodeDescription=[child2] index=[3] depth=[1]]'
        ]
      )
    })

    it('Create tree from node using insertChild', function () {
      const parent1 = new Xmltr('<parent>')
      const child1 = new Xmltr('<child1>')
      const parent2 = new Xmltr('<parent2>')
      const child2 = new Xmltr('<child2>')
      parent1.insertChild(child1)
      parent2.insertChild(child2)
      parent1.insertChild(parent2)
      assert.deepEqual(
        parent1.reprDeep(),
        [
          '[nodeDescription=[parent] index=[0] depth=[0]]',
          '[nodeDescription=[child1] index=[1] depth=[1]]',
          '[nodeDescription=[parent2] index=[2] depth=[1]]',
          '[nodeDescription=[child2] index=[3] depth=[2]]'
        ]
      )
    })
  })
})
