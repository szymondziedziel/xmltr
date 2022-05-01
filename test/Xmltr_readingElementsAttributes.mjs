import assert from 'assert'
import { Xmltr } from '../xmltr.mjs'

// Taken from https://docs.microsoft.com/en-us/dotnet/standard/linq/sample-xml-file-test-configuration-namespace
// Edited a bit to handle more tests
const SOME_COMPLEX_XML = `
<?xml version="1.0"?>
<Tests xmlns="http://www.adatum.com">
  <Test TestId="0001" TestType="CMD" TestType="GUI">
    <Name>Convert number to string</Name>
    <CommandLine>Examp1.EXE</CommandLine>
    <Input>1</Input>
    <Output>One</Output>
  </Test>
  <Test TestId="0002" TestType="CMD" TestType="OTHER">
    <Name>Find succeeding characters</Name>
    <CommandLine>Examp2.EXE</CommandLine>
    <Input>abc</Input>
    <Output>def</Output>
  </Test>
  <Test TestId="0003" TestType="GUI">
    <Name>Convert multiple numbers to strings</Name>
    <CommandLine>Examp2.EXE /Verbose</CommandLine>
    <Input>123</Input>
    <Output>One Two Three</Output>
  </Test>
  <Test TestId="0004" TestType="GUI">
    <Name>Find correlated key</Name>
    <CommandLine>Examp3.EXE</CommandLine>
    <Input>a1</Input>
    <Output>b1</Output>
  </Test>
  <Test TestId="0005" TestType="GUI">
    <Name>Count characters</Name>
    <CommandLine>FinalExamp.EXE</CommandLine>
    <Input>This is a test</Input>
    <Output>14</Output>
  </Test>
  <Test TestId="0006" TestType="GUI">
    <Name>Another Test</Name>
    <CommandLine>Examp2.EXE</CommandLine>
    <Input>Test Input</Input>
    <Output>10</Output>
  </Test>
</Tests>
`
const SOME_SIMPLE_XML = '<tag bool bool1="true" bool2="bool3" bool4="bool5 bool6 bool7 " bool1 bool1="false">'

describe('Xmltr', function () {
  describe('getAttr method', function () {
    describe('Getting no attributes with getAttr method', function () {
      it('It should throw error when no attribute name provided', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.getAttr(),
          Xmltr.Errors.NoAttributeNameProvided
        )
      })

      it('It should throw error when any of provided attribute name is not of string type', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.getAttr('test', 2, [], {}),
          Xmltr.Errors.WrongAttributeNameTypeProvided
        )
      })
    })

    describe('Getting single attribute with getAttr method', function () {
      it('It should get single attribute value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[0].getAttr('TestId'),
          '0001'
        )
      })

      it('It should get single attribute value of second Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[1].getAttr('TestId'),
          '0002'
        )
      })

      it('It should get single attribute value of last Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[5].getAttr('TestId'),
          '0006'
        )
      })

      it('It should get attributes values of all Test tags', function() {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test').map(tag => tag.getAttr('TestId')),
          [1, 2, 3, 4, 5, 6].map(e => e.toString().padStart(4, '0'))
        )
      })
    })

    describe('Getting multiple attribute with getAttr method', function () {
      it('It should get multiple attributes value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].getAttr('TestId', 'TestType'),
          ['0001', 'CMD']
        )
      })

      it('It should get multiple attributes value of first Test tag, also responds with nulls to non existing', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].getAttr('a', 'TestId', 'b', 'TestType', 'c'),
          [null, '0001', null, 'CMD', null]
        )
      })
    })

    describe('Getting single boolean attribute with getAttr method', function () {
      it('It should return boolean attribute as null when not found', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.getAttr('non-existing-bool'), null)
      })

      it('It should return boolean attribute as true when found', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.getAttr('bool'), true)
      })

      it('It should return attribute value as string-true when found and is not boolean attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.getAttr('bool1'), 'true')
      })

      it('It should return boolean attribute as null when attribute name is value of other attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.getAttr('bool3'), null)
      })

      it('It should return boolean attribute as null when attribute name is part of value of other attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.getAttr('bool4'), 'bool5 bool6 bool7 ')
        assert.equal(tree.getAttr('bool5'), null)
        assert.equal(tree.getAttr('bool6'), null)
        assert.equal(tree.getAttr('bool7'), null)
      })
    })
  })

  describe('getMultiAttr method', function () {
    describe('Getting no attributes with getMultiAttr method', function () {
      it('It should throw error when no attribute name provided', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.getMultiAttr(),
          Xmltr.Errors.NoAttributeNameProvided
        )
      })

      it('It should throw error when any of provided attribute name is not of string type', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.getMultiAttr('test', 2, [], {}),
          Xmltr.Errors.WrongAttributeNameTypeProvided
        )
      })
    })

    describe('Getting single attribute with getMultiAttr method', function () {
      it('It should get all attribute values of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].getMultiAttr('TestType'),
          ['CMD', 'GUI']
        )
      })

      it('It should get all attribute values of second Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[1].getMultiAttr('TestType'),
          ['CMD', 'OTHER']
        )
      })
    })

    describe('Getting multiple attribute with getMultiAttr method', function () {
      it('It should get multiple attributes value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].getMultiAttr('TestId', 'TestType'),
          [['0001'], ['CMD', 'GUI']]
        )
      })

      it('It should get multiple attributes value of first Test tag, also responds with empty arrays to non existing', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].getMultiAttr('a', 'TestId', 'b', 'TestType', 'c'),
          [[], ['0001'], [], ['CMD', 'GUI'], []]
        )
      })
    })

    describe('Getting multiple mixed attributes with getMultiAttr method', function () {
      it('It should get ', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.deepEqual(
          tree.getMultiAttr('a', 'bool', 'bool1', 'bool2', 'bool4'),
          [[], [true], ['true', true, 'false'], ['bool3'], ['bool5 bool6 bool7 ']]
        )
      })
    })
  })
})
