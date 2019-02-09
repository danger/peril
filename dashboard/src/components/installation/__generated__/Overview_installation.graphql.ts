/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type Overview_installation = {
    readonly iID: number;
    readonly login: string;
    readonly avatarURL: string | null;
};



const node: ConcreteFragment = {
  "kind": "Fragment",
  "name": "Overview_installation",
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
      "name": "login",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "avatarURL",
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
(node as any).hash = 'e57b695313b998e59c0d118f9d35e342';
export default node;
