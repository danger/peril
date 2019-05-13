/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
export type SetJSONPathForm_installation$ref = any;
export type SetJSONPathForm_installation = {
    readonly iID: number;
    readonly " $refType": SetJSONPathForm_installation$ref;
};



const node: ReaderFragment = {
  "kind": "Fragment",
  "name": "SetJSONPathForm_installation",
  "type": "Installation",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "iID",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = 'c0971694f3ca6aab4d7b2d46f885e036';
export default node;
