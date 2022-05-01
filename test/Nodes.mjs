import assert from 'assert'
import { Xmltr } from '../xmltr.mjs'

describe('Xmltr', function () {
  describe('Statics', function () {
    it('Should prepare single tag node description', function () {
      const tree = new Xmltr('<a a="b" c="d" />')
      const tagDesc = Xmltr.fromNode(tree, tree.nodes[0])._tagDesc()
      assert.deepEqual(
        tagDesc,
        { tagName: 'a', attrs: { a: 'b', c: 'd' } }
      )
    })
  })

  describe('Usage', function () {
    it('Should create appropriate object', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).reprDeep(),
        [
          '[nodeDescription=[p] index=[0] depth=[0]]',
          '[nodeDescription=[c /] index=[1] depth=[1]]',
          '[nodeDescription=[c] index=[2] depth=[1]]'
        ]
      )
    })

    it('Should create appropriate object with text node', function () {
      assert.deepEqual(
        (new Xmltr('<p><c>test text</c><c /></p>')).reprDeep(),
        [
          '[nodeDescription=[p] index=[0] depth=[0]]',
          '[nodeDescription=[c] index=[1] depth=[1]]',
          '[nodeDescription=[#text test text] index=[2] depth=[2]]',
          '[nodeDescription=[c /] index=[3] depth=[1]]'
        ]
      )
    })

    it('Should create appropriate object with text node 2', function () {
      assert.deepEqual(
        (new Xmltr('<persons><student><first-name>John</first-name><last-name>Doe</last-name></student></persons>')).reprDeep(),
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

    it('Should find p by tag', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).byTags('p')[0].reprShallow(),
        '[nodeDescription=[p] index=[0] depth=[0]]'
      )
    })

    it('Should find c by tag', function () {
      assert.deepEqual(
        (new Xmltr('<p><c /><c></c></p>')).byTags('c').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c /] index=[1] depth=[1]]',
          '[nodeDescription=[c] index=[2] depth=[1]]'
        ]
      )
    })

    it('Should find c with enabled attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrs('enabled').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c enabled="true"/] index=[1] depth=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrsVals('enabled="true"').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c enabled="true"/] index=[1] depth=[1]]'
        ]
      )
    })

    it('Should find c with enabled boolean attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled/><c></c></p>')).byAttrs('enabled').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c enabled/] index=[1] depth=[1]]'
        ]
      )
    })

    it('Should find c with enabled="true" attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true"/><c></c></p>')).byAttrsVals('enabled="true"').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c enabled="true"/] index=[1] depth=[1]]'
        ]
      )
    })

    it('Should find c that has any enabled attribute', function () {
      assert.deepEqual(
        (new Xmltr('<p><c enabled="true" /><c enabled="false"></c></p>')).byAttrs('enabled').map(node => node.reprShallow()),
        [
          '[nodeDescription=[c enabled="true" /] index=[1] depth=[1]]',
          '[nodeDescription=[c enabled="false"] index=[2] depth=[1]]'
        ]
      )
    })
  })
})
