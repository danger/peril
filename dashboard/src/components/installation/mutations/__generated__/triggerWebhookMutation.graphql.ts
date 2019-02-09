/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type triggerWebhookMutationVariables = {
    readonly iID: number;
    readonly eventID: string;
};
export type triggerWebhookMutationResponse = {
    readonly sendWebhookForInstallation: ({
        readonly event: string;
    }) | null;
};



/*
mutation triggerWebhookMutation(
  $iID: Int!
  $eventID: String!
) {
  sendWebhookForInstallation(iID: $iID, eventID: $eventID) {
    event
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "iID",
    "type": "Int!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "eventID",
    "type": "String!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "sendWebhookForInstallation",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "eventID",
        "variableName": "eventID",
        "type": "String!"
      },
      {
        "kind": "Variable",
        "name": "iID",
        "variableName": "iID",
        "type": "Int!"
      }
    ],
    "concreteType": "RecordedWebhook",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "event",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "triggerWebhookMutation",
  "id": null,
  "text": "mutation triggerWebhookMutation(\n  $iID: Int!\n  $eventID: String!\n) {\n  sendWebhookForInstallation(iID: $iID, eventID: $eventID) {\n    event\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "triggerWebhookMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "triggerWebhookMutation",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
(node as any).hash = 'c938f75ed56e10ff77251c0e45c9f2eb';
export default node;
