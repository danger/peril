/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
export type Websocket_installation$ref = any;
export type Websocket_installation = {
    readonly iID: number;
    readonly perilSettingsJSONURL: string;
    readonly " $refType": Websocket_installation$ref;
};



const node: ReaderFragment = {
  "kind": "Fragment",
  "name": "Websocket_installation",
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
      "alias": null,
      "name": "perilSettingsJSONURL",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = '8f9489007f1ee6e8e28390a7de26e47a';
export default node;
