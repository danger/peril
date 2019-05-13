/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type makeInstallationRecordMutationVariables = {
    readonly iID: number;
};
export type makeInstallationRecordMutationResponse = {
    readonly makeInstallationRecord: ({
        readonly login?: string;
        readonly error?: {
            readonly description: string;
        } | null;
    } & ({
        readonly login: string;
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
export type makeInstallationRecordMutation = {
    readonly response: makeInstallationRecordMutationResponse;
    readonly variables: makeInstallationRecordMutationVariables;
};



/*
mutation makeInstallationRecordMutation(
  $iID: Int!
) {
  makeInstallationRecord(iID: $iID) {
    __typename
    ... on Installation {
      login
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
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "iID",
    "variableName": "iID"
  }
],
v2 = {
  "kind": "InlineFragment",
  "type": "Installation",
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "login",
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
    "name": "makeInstallationRecordMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "makeInstallationRecord",
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
    "name": "makeInstallationRecordMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "makeInstallationRecord",
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
    "name": "makeInstallationRecordMutation",
    "id": null,
    "text": "mutation makeInstallationRecordMutation(\n  $iID: Int!\n) {\n  makeInstallationRecord(iID: $iID) {\n    __typename\n    ... on Installation {\n      login\n    }\n    ... on MutationError {\n      error {\n        description\n      }\n    }\n    ... on Node {\n      id\n    }\n  }\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '9f4e7845852f7f10f6fcb845d0f91c54';
export default node;
