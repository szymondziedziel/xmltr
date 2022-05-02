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
  describe('rmAttr method', function () {
    describe('Removing no attributes with rmAttr method', function () {
      it('It should throw error when no attribute name provided', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.rmAttr(),
          Xmltr.Errors.NoAttributeNameProvided
        )
      })

      it('It should throw error when any of provided attribute name is not of string type', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.rmAttr('test', 2, [], {}),
          Xmltr.Errors.WrongAttributeNameTypeProvided
        )
      })
    })

    describe('Removing single attribute with rmAttr method', function () {
      it('It should remove single attribute value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[0].rmAttr('TestId'),
          true
        )
      })

      it('It should remove single attribute value of second Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[1].rmAttr('TestId'),
          true
        )
      })

      it('It should remove single attribute value of last Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.equal(
          tree.byTags('Test')[5].rmAttr('TestId'),
          true
        )
      })

      it('It should remove attributes values of all Test tags', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test').map(tag => tag.rmAttr('TestId')),
          [1, 2, 3, 4, 5, 6].map(e => true)
        )
      })
    })

    describe('Removing multiple attribute with rmAttr method', function () {
      it('It should remove multiple attributes value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].rmAttr('TestId', 'TestType'),
          [true, true]
        )
      })

      it('It should remove multiple attributes value of first Test tag, also responds with nulls to non existing', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].rmAttr('a', 'TestId', 'b', 'TestType', 'c'),
          [false, true, false, true, false]
        )
      })
    })

    describe('Removing single boolean attribute with rmAttr method', function () {
      it('It should return boolean attribute as null when not found', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.rmAttr('non-existing-bool'), false)
      })

      it('It should return boolean attribute as true when found', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.rmAttr('bool'), true)
      })

      it('It should return attribute value as string-true when found and is not boolean attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.rmAttr('bool1'), true)
      })

      it('It should return boolean attribute as null when attribute name is value of other attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.rmAttr('bool3'), false)
      })

      it('It should return boolean attribute as null when attribute name is part of value of other attribute', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.equal(tree.rmAttr('bool4'), true)
        assert.equal(tree.rmAttr('bool5'), false)
        assert.equal(tree.rmAttr('bool6'), false)
        assert.equal(tree.rmAttr('bool7'), false)
      })
    })
  })

  describe('rmMultiAttr method', function () {
    describe('Removing no attributes with rmMultiAttr method', function () {
      it('It should throw error when no attribute name provided', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.rmMultiAttr(),
          Xmltr.Errors.NoAttributeNameProvided
        )
      })

      it('It should throw error when any of provided attribute name is not of string type', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.throws(
          () => tree.rmMultiAttr('test', 2, [], {}),
          Xmltr.Errors.WrongAttributeNameTypeProvided
        )
      })
    })

    describe('Removing single attribute with rmMultiAttr method', function () {
      it('It should remove all attribute values of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].rmMultiAttr('TestType'),
          [2]
        )
      })

      it('It should remove all attribute values of second Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[1].rmMultiAttr('TestType'),
          [2]
        )
      })
    })

    describe('Removing multiple attribute with rmMultiAttr method', function () {
      it('It should remove multiple attributes value of first Test tag', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].rmMultiAttr('TestId', 'TestType'),
          [1, 2]
        )
      })

      it('It should remove multiple attributes value of first Test tag, also responds with empty arrays to non existing', function () {
        const tree = new Xmltr(SOME_COMPLEX_XML)
        assert.deepEqual(
          tree.byTags('Test')[0].rmMultiAttr('a', 'TestId', 'b', 'TestType', 'c'),
          [0, 1, 0, 2, 0]
        )
      })
    })

    describe('Removing multiple mixed attributes with rmMultiAttr method', function () {
      it('It should remove all mixed attributes\' values, also should respond with empty arrays to non existing', function () {
        const tree = new Xmltr(SOME_SIMPLE_XML)
        assert.deepEqual(
          tree.rmMultiAttr('a', 'bool', 'bool1', 'bool2', 'bool4'),
          [0, 1, 3, 1, 1]
        )
      })
    })
  })
})
