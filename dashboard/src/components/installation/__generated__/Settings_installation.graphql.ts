/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
export type Settings_installation$ref = any;
export type Settings_installation = {
    readonly iID: number;
    readonly installationSlackUpdateWebhookURL: string | null;
    readonly perilSettingsJSONURL: string;
    readonly " $refType": Settings_installation$ref;
};



const node: ReaderFragment = {
  "kind": "Fragment",
  "name": "Settings_installation",
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
      "name": "installationSlackUpdateWebhookURL",
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
(node as any).hash = '86b2fea621074057a25edb244f6c24ac';
export default node;
