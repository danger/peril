/* tslint:disable */

import { ReaderFragment } from "relay-runtime";
export type WebhooksHeader_installation$ref = any;
export type WebhooksHeader_installation = {
    readonly iID: number;
    readonly recordWebhooksUntilTime: string | null;
    readonly startedRecordingWebhooksTime: string | null;
    readonly " $refType": WebhooksHeader_installation$ref;
};



const node: ReaderFragment = {
  "kind": "Fragment",
  "name": "WebhooksHeader_installation",
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
      "name": "recordWebhooksUntilTime",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "startedRecordingWebhooksTime",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = '8b0a4042a9cccff0bf61aef13beb57ec';
export default node;
