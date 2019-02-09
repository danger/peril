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
        "variableName": "iID",
        "type": "Int!"
      },
      {
        "kind": "Variable",
        "name": "key",
        "variableName": "key",
        "type": "String!"
      },
      {
        "kind": "Variable",
        "name": "value",
        "variableName": "value",
        "type": "String"
      }
    ],
    "storageKey": null
  }
];
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "editEnvVarMutation",
  "id": null,
  "text": "mutation editEnvVarMutation(\n  $iID: Int!\n  $key: String!\n  $value: String\n) {\n  changeEnvVarForInstallation(iID: $iID, key: $key, value: $value)\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "editEnvVarMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "editEnvVarMutation",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
(node as any).hash = '1fdb444a61410778161b8fb8c7fe9024';
export default node;
