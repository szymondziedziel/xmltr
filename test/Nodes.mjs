import assert from 'assert'
import { Nodes } from '../xmltr.mjs'

describe('Nodes', function () {
  describe('Usage', function () {
    it('Should create appropriate object', function () {
      assert.deepEqual(
        (new Nodes('<p><c /><c></c></p>')).toArrayOfStrings(),
        [
          '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[c /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should create appropriate object with text node', function () {
      assert.deepEqual(
        (new Nodes('<p><c>test text</c><c /></p>')).toArrayOfStrings(),
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
        (new Nodes('<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>')).toArrayOfStrings(),
        [
          '[nodeDescription=[persons] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[student] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[first-name] nodeIndex=[2] nestingLevel=[2]]',
          '[nodeDescription=[#text John] nodeIndex=[3] nestingLevel=[3]]',
          '[nodeDescription=[last-name] nodeIndex=[4] nestingLevel=[2]]',
          '[nodeDescription=[#text Doe] nodeIndex=[5] nestingLevel=[3]]',
        ]
      )
    })

    it('Should find p by tag', function () {
      assert.deepEqual(
        (new Nodes('<p><c /><c></c></p>')).byTags(['p']).map(node => node.toString()),
        [
          '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]'
        ]
      )
    })

    it('Should find c by tag', function () {
      assert.deepEqual(
        (new Nodes('<p><c /><c></c></p>')).byTags(['c']).map(node => node.toString()),
        [
          '[nodeDescription=[c /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled attribute', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true"/><c></c></p>')).byAttrs(['enabled']).map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true"/><c></c></p>')).byAttrsVals(['enabled="true"']).map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled boolean attribute', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled/><c></c></p>')).byAttrs(['enabled']).map(node => node.toString()),
        [
          '[nodeDescription=[c enabled/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true"/><c></c></p>')).byAttrsVals(['enabled="true"']).map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true"/] nodeIndex=[1] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find c that has any enabled attribute', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byAttrs(['enabled']).map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true" /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c enabled="false"] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find children', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byTags(['p'])[0].children().map(node => node.toString()),
        [
          '[nodeDescription=[c enabled="true" /] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[c enabled="false"] nodeIndex=[2] nestingLevel=[1]]'
        ]
      )
    })

    it('Should find parent of first c', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byTags(['c'])[0].parent().toString(),
        '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]'
      )
    })

    it('Should find parent of first c', function () {
      assert.deepEqual(
        (new Nodes('<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>')).byTags(['first-name'])[0].children()[0].parent().toString(),
        '[nodeDescription=[first-name] nodeIndex=[2] nestingLevel=[2]]'
      )
    })


    it('Should find parent of first p', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byTags(['p'])[0].parent(),
        null
      )
    })

    it('Should find parent of second c', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byTags(['c'])[1].parent().toString(),
        '[nodeDescription=[p] nodeIndex=[0] nestingLevel=[0]]'
      )
    })

    it('Should find no children of first c', function () {
      assert.deepEqual(
        (new Nodes('<p><c enabled="true" /><c enabled="false"></c></p>')).byTags(['c'])[0].children().map(node => node.toString()),
        []
      )
    })

    it('Should create appropriate object with text node 2', function () {
      const tree = new Nodes('<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>')
      const firstName = tree.byTags(['first-name'])[0]
      firstName.rm()
      assert.deepEqual(
        tree.toArrayOfStrings(),
        [
          '[nodeDescription=[persons] nodeIndex=[0] nestingLevel=[0]]',
          '[nodeDescription=[student] nodeIndex=[1] nestingLevel=[1]]',
          '[nodeDescription=[last-name] nodeIndex=[4] nestingLevel=[2]]',
          '[nodeDescription=[#text Doe] nodeIndex=[5] nestingLevel=[3]]'
        ]
      )
    })
  })
})
