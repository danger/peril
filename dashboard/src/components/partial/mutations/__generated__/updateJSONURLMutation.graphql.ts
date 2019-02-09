/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type updateJSONURLMutationVariables = {
    readonly iID: number;
    readonly perilSettingsJSONURL: string;
};
export type updateJSONURLMutationResponse = {
    readonly convertPartialInstallation: ({
        readonly perilSettingsJSONURL?: string;
        readonly error?: ({
            readonly description: string;
        }) | null;
    }) | null;
};



/*
mutation updateJSONURLMutation(
  $iID: Int!
  $perilSettingsJSONURL: String!
) {
  convertPartialInstallation(iID: $iID, perilSettingsJSONURL: $perilSettingsJSONURL) {
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
      __id: id
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
    "type": "String!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "iID",
    "variableName": "iID",
    "type": "Int!"
  },
  {
    "kind": "Variable",
    "name": "perilSettingsJSONURL",
    "variableName": "perilSettingsJSONURL",
    "type": "String"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": "__id",
  "name": "id",
  "args": null,
  "storageKey": null
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
},
v4 = {
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
};
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "updateJSONURLMutation",
  "id": null,
  "text": "mutation updateJSONURLMutation(\n  $iID: Int!\n  $perilSettingsJSONURL: String!\n) {\n  convertPartialInstallation(iID: $iID, perilSettingsJSONURL: $perilSettingsJSONURL) {\n    __typename\n    ... on Installation {\n      perilSettingsJSONURL\n    }\n    ... on MutationError {\n      error {\n        description\n      }\n    }\n    ... on Node {\n      __id: id\n    }\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "updateJSONURLMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "convertPartialInstallation",
        "storageKey": null,
        "args": v1,
        "concreteType": null,
        "plural": false,
        "selections": [
          v2,
          v3,
          v4
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "updateJSONURLMutation",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "convertPartialInstallation",
        "storageKey": null,
        "args": v1,
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
          v2,
          v3,
          v4
        ]
      }
    ]
  }
};
})();
(node as any).hash = 'e89cffa23db8aaf594bd116f56d381be';
export default node;
