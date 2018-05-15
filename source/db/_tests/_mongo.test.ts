import { convertDBRepresentationToModel, prepareToSave } from "../mongo"

it("converts $ and . in user input to something mongo safe", () => {
  const before = {
    rules: {
      "thing.thing$": "ok",
    },
  }
  const after = {
    rules: {
      "thing___thing^^^": "ok",
    },
  }

  // to mongo
  expect(prepareToSave(before)).toEqual(after)
})

it("converts $ and . from to user input", () => {
  const before = {
    rules: {
      "thing.thing$": "ok",
    },
  }
  const after = {
    rules: {
      "thing___thing^^^": "ok",
    },
  }

  // from mongo
  expect(convertDBRepresentationToModel(after as any)).toEqual(before)
})
