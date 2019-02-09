/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type Websocket_installation = {
    readonly iID: number;
    readonly perilSettingsJSONURL: string;
};



const node: ConcreteFragment = {
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
(node as any).hash = '8f9489007f1ee6e8e28390a7de26e47a';
export default node;
