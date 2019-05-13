/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
export type Overview_installation$ref = any;
export type Overview_installation = {
    readonly iID: number;
    readonly login: string;
    readonly avatarURL: string | null;
    readonly " $refType": Overview_installation$ref;
};



const node: ReaderFragment = {
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
    }
  ]
};
(node as any).hash = 'e57b695313b998e59c0d118f9d35e342';
export default node;
