/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type runTaskMutationVariables = {
    readonly iID: number;
    readonly task: string;
    readonly data: any;
};
export type runTaskMutationResponse = {
    readonly runTask: ({
        readonly success: boolean | null;
    }) | null;
};



/*
mutation runTaskMutation(
  $iID: Int!
  $task: String!
  $data: JSON!
) {
  runTask(iID: $iID, task: $task, data: $data) {
    success
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
    "name": "task",
    "type": "String!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "data",
    "type": "JSON!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "runTask",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "data",
        "variableName": "data",
        "type": "JSON"
      },
      {
        "kind": "Variable",
        "name": "iID",
        "variableName": "iID",
        "type": "Int!"
      },
      {
        "kind": "Variable",
        "name": "task",
        "variableName": "task",
        "type": "String!"
      }
    ],
    "concreteType": "MutationWithSuccess",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "success",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "runTaskMutation",
  "id": null,
  "text": "mutation runTaskMutation(\n  $iID: Int!\n  $task: String!\n  $data: JSON!\n) {\n  runTask(iID: $iID, task: $task, data: $data) {\n    success\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "runTaskMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "runTaskMutation",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
(node as any).hash = '89194f0b62aefa4ce4470917890e5250';
export default node;
