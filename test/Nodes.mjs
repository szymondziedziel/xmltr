import assert from 'assert'
import { Xmltr } from '../xmltr.mjs'

describe('Xmltr', function () {
  describe('Statics', function () {
    it('Should prepare single tag node description', function() {
      const tree = new Xmltr('<a a="b" c="d" />')
      const tagDesc = Xmltr.fromNode(tree, tree.nodes[0])._tagDesc()
      assert.deepEqual(
        tagDesc,
        { tagName: 'a', attrs: {a: 'b', c: 'd'}}
      )
    })
  })

  describe('Usage', function () {
    it('Should create appropriate object', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).toString(),
        [
          '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[c /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should create appropriate object with text node', function () {
      assert.deepEqual(
        (new Xmltr('<p><c>test text</c><c /></p>')).toString(),
        [
          '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[c] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[#text test text] nodeIndex=[2] nestingLevel=[2]]',
          '[nodeDescription=[c /] nodeIndex=[3] nestingLevel=[1]]'
        ]
      )
    })

    it('Should create appropriate object with text node 2', function () {
      assert.deepEqual(
        (new Xmltr('<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>')).toString(),
        [
          '[nodeDescription=[persons] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[student] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[first-name] nodeIndex=[2] nestingLevel=[2]]',
          '[nodeDescription=[#text John] nodeIndex=[3] nestingLevel=[3]]',
          '[nodeDescription=[last-name] nodeIndex=[4] nestingLevel=[2]]',
          '[nodeDescription=[#text Doe] nodeIndex=[5] nestingLevel=[3]]'
        ]
      )
    })

    it('Should find p by tag', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).byTags('p')[0].toString(),
        '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]'
      )
    })

    it('Should find c by tag', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).byTags('c').map(node => node.toString()),
        [
          '[nodeDescription=[c /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrs('enabled').map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrsVals('enabled="true"').map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled boolean attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled/><c></c></p>')).byAttrs('enabled').map(node => node.toString()),
        [
          '[nodeDescription=[c enabled/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrsVals('enabled="true"').map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c that has any enabled attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true" /><c enabled="false"></c></p>')).byAttrs('enabled').map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true" /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c enabled="false"] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })
  })
})
