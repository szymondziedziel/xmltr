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

const SOME_COMPLEX_XML_REPR_1 = [
  '[nodeDescription=[?xml version="1.0"?] index=[0] depth=[0]]',
  '[nodeDescription=[Tests xmlns="http://www.adatum.com"] index=[1] depth=[1]]',
  '[nodeDescription=[Test TestId="0001" TestType="CMD" TestType="GUI"] index=[2] depth=[2]]',
  '[nodeDescription=[Name] index=[3] depth=[3]]',
  '[nodeDescription=[#text Convert number to string] index=[4] depth=[4]]',
  '[nodeDescription=[Input] index=[5] depth=[3]]',
  '[nodeDescription=[#text 1] index=[6] depth=[4]]',
  '[nodeDescription=[Output] index=[7] depth=[3]]',
  '[nodeDescription=[#text One] index=[8] depth=[4]]',
  '[nodeDescription=[Test TestId="0002" TestType="CMD" TestType="OTHER"] index=[9] depth=[2]]',
  '[nodeDescription=[Name] index=[10] depth=[3]]',
  '[nodeDescription=[#text Find succeeding characters] index=[11] depth=[4]]',
  '[nodeDescription=[Input] index=[12] depth=[3]]',
  '[nodeDescription=[#text abc] index=[13] depth=[4]]',
  '[nodeDescription=[Output] index=[14] depth=[3]]',
  '[nodeDescription=[#text def] index=[15] depth=[4]]',
  '[nodeDescription=[Test TestId="0003" TestType="GUI"] index=[16] depth=[2]]',
  '[nodeDescription=[Name] index=[17] depth=[3]]',
  '[nodeDescription=[#text Convert multiple numbers to strings] index=[18] depth=[4]]',
  '[nodeDescription=[Input] index=[19] depth=[3]]',
  '[nodeDescription=[#text 123] index=[20] depth=[4]]',
  '[nodeDescription=[Output] index=[21] depth=[3]]',
  '[nodeDescription=[#text One Two Three] index=[22] depth=[4]]',
  '[nodeDescription=[Test TestId="0004" TestType="GUI"] index=[23] depth=[2]]',
  '[nodeDescription=[Name] index=[24] depth=[3]]',
  '[nodeDescription=[#text Find correlated key] index=[25] depth=[4]]',
  '[nodeDescription=[Input] index=[26] depth=[3]]',
  '[nodeDescription=[#text a1] index=[27] depth=[4]]',
  '[nodeDescription=[Output] index=[28] depth=[3]]',
  '[nodeDescription=[#text b1] index=[29] depth=[4]]',
  '[nodeDescription=[Test TestId="0005" TestType="GUI"] index=[30] depth=[2]]',
  '[nodeDescription=[Name] index=[31] depth=[3]]',
  '[nodeDescription=[#text Count characters] index=[32] depth=[4]]',
  '[nodeDescription=[Input] index=[33] depth=[3]]',
  '[nodeDescription=[#text This is a test] index=[34] depth=[4]]',
  '[nodeDescription=[Output] index=[35] depth=[3]]',
  '[nodeDescription=[#text 14] index=[36] depth=[4]]',
  '[nodeDescription=[Test TestId="0006" TestType="GUI"] index=[37] depth=[2]]',
  '[nodeDescription=[Name] index=[38] depth=[3]]',
  '[nodeDescription=[#text Another Test] index=[39] depth=[4]]',
  '[nodeDescription=[Input] index=[40] depth=[3]]',
  '[nodeDescription=[#text Test Input] index=[41] depth=[4]]',
  '[nodeDescription=[Output] index=[42] depth=[3]]',
  '[nodeDescription=[#text 10] index=[43] depth=[4]]'
]

describe('Xmltr', function () {
  describe('rm method', function () {
    it('It should properly remove serie of elements', function () {
      const tree = new Xmltr(SOME_COMPLEX_XML)
      // console.log(JSON.stringify(tree.toString(), null, 4))
      const commandLines = tree.byTags('CommandLine')
      commandLines.forEach(c => c.rm())
      assert.deepEqual(
        tree.reprDeep(),
        SOME_COMPLEX_XML_REPR_1
      )
    })
  })
})
