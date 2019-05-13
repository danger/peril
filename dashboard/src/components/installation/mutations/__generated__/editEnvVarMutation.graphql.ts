/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type editEnvVarMutationVariables = {
    readonly iID: number;
    readonly key: string;
    readonly value?: string | null;
};
export type editEnvVarMutationResponse = {
    readonly changeEnvVarForInstallation: any | null;
};
export type editEnvVarMutation = {
    readonly response: editEnvVarMutationResponse;
    readonly variables: editEnvVarMutationVariables;
};



/*
mutation editEnvVarMutation(
  $iID: Int!
  $key: String!
  $value: String
) {
  changeEnvVarForInstallation(iID: $iID, key: $key, value: $value)
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
    "name": "key",
    "type": "String!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "value",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "changeEnvVarForInstallation",
    "args": [
      {
        "kind": "Variable",
        "name": "iID",
        "variableName": "iID"
      },
      {
        "kind": "Variable",
        "name": "key",
        "variableName": "key"
      },
      {
        "kind": "Variable",
        "name": "value",
        "variableName": "value"
      }
    ],
    "storageKey": null
  }
];
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "editEnvVarMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "operation": {
    "kind": "Operation",
    "name": "editEnvVarMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": (v1/*: any*/)
  },
  "params": {
    "operationKind": "mutation",
    "name": "editEnvVarMutation",
    "id": null,
    "text": "mutation editEnvVarMutation(\n  $iID: Int!\n  $key: String!\n  $value: String\n) {\n  changeEnvVarForInstallation(iID: $iID, key: $key, value: $value)\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '1fdb444a61410778161b8fb8c7fe9024';
export default node;
