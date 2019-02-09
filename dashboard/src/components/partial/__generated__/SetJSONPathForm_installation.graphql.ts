/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type SetJSONPathForm_installation = {
    readonly iID: number;
};



const node: ConcreteFragment = {
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
    },
    {
      "kind": "ScalarField",
      "alias": "__id",
      "name": "id",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = 'c0971694f3ca6aab4d7b2d46f885e036';
export default node;
