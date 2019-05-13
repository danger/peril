/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type editInstallationMutationMutationVariables = {
    readonly iID: number;
    readonly perilSettingsJSONURL?: string | null;
    readonly installationSlackUpdateWebhookURL?: string | null;
};
export type editInstallationMutationMutationResponse = {
    readonly editInstallation: ({
        readonly perilSettingsJSONURL?: string;
        readonly error?: {
            readonly description: string;
        } | null;
    } & ({
        readonly perilSettingsJSONURL: string;
    } | {
        readonly error: {
            readonly description: string;
        } | null;
    } | {
        /*This will never be '% other', but we need some
        value in case none of the concrete values match.*/
        readonly __typename: "%other";
    })) | null;
};
export type editInstallationMutationMutation = {
    readonly response: editInstallationMutationMutationResponse;
    readonly variables: editInstallationMutationMutationVariables;
};



/*
mutation editInstallationMutationMutation(
  $iID: Int!
  $perilSettingsJSONURL: String
  $installationSlackUpdateWebhookURL: String
) {
  editInstallation(iID: $iID, perilSettingsJSONURL: $perilSettingsJSONURL, installationSlackUpdateWebhookURL: $installationSlackUpdateWebhookURL) {
    __typename
    ... on Installation {
      perilSettingsJSONURL
    }
    ... on MutationError {
      error {
        description
      }
    }
    ... on Node {
      id
    }
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
    "name": "perilSettingsJSONURL",
    "type": "String",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "installationSlackUpdateWebhookURL",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "iID",
    "variableName": "iID"
  },
  {
    "kind": "Variable",
    "name": "installationSlackUpdateWebhookURL",
    "variableName": "installationSlackUpdateWebhookURL"
  },
  {
    "kind": "Variable",
    "name": "perilSettingsJSONURL",
    "variableName": "perilSettingsJSONURL"
  }
],
v2 = {
  "kind": "InlineFragment",
  "type": "Installation",
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "perilSettingsJSONURL",
      "args": null,
      "storageKey": null
    }
  ]
},
v3 = {
  "kind": "InlineFragment",
  "type": "MutationError",
  "selections": [
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "error",
      "storageKey": null,
      "args": null,
      "concreteType": "Error",
      "plural": false,
      "selections": [
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "description",
          "args": null,
          "storageKey": null
        }
      ]
    }
  ]
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "editInstallationMutationMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "editInstallation",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "editInstallationMutationMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "editInstallation",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "__typename",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
            "args": null,
            "storageKey": null
          },
          (v2/*: any*/),
          (v3/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "operationKind": "mutation",
    "name": "editInstallationMutationMutation",
    "id": null,
    "text": "mutation editInstallationMutationMutation(\n  $iID: Int!\n  $perilSettingsJSONURL: String\n  $installationSlackUpdateWebhookURL: String\n) {\n  editInstallation(iID: $iID, perilSettingsJSONURL: $perilSettingsJSONURL, installationSlackUpdateWebhookURL: $installationSlackUpdateWebhookURL) {\n    __typename\n    ... on Installation {\n      perilSettingsJSONURL\n    }\n    ... on MutationError {\n      error {\n        description\n      }\n    }\n    ... on Node {\n      id\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '0821e5b772531b8e4ef695f769e52dca';
export default node;
