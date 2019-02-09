/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type Webhooks_installation = {
    readonly iID: number;
    readonly webhooks: {
        readonly edges: ReadonlyArray<({
            readonly node: ({
                readonly event: string;
                readonly iID: number;
                readonly createdAt: any;
                readonly eventID: string;
            }) | null;
        }) | null> | null;
    };
};



const node: ConcreteFragment = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "iID",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "Webhooks_installation",
  "type": "Installation",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    v0,
    {
      "kind": "FragmentSpread",
      "name": "WebhooksHeader_installation",
      "args": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "webhooks",
      "storageKey": null,
      "args": null,
      "concreteType": "RecordedWebhookConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "RecordedWebhookEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "RecordedWebhook",
              "plural": false,
              "selections": [
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "event",
                  "args": null,
                  "storageKey": null
                },
                v0,
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "createdAt",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "eventID",
                  "args": null,
                  "storageKey": null
                }
              ]
            }
          ]
        }
      ]
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
})();
(node as any).hash = '587a6bb3e01c2679a1d8bdaaa3ec8c9a';
export default node;
