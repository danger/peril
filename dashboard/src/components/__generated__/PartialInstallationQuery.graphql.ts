/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type PartialInstallationQueryVariables = {
    readonly id: number;
};
export type PartialInstallationQueryResponse = {
    readonly installation: ({
        readonly login: string;
    }) | null;
};



/*
query PartialInstallationQuery(
  $id: Int!
) {
  installation(iID: $id) {
    login
    ...SetJSONPathForm_installation
    __id: id
  }
}

fragment SetJSONPathForm_installation on Installation {
  iID
  __id: id
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "id",
    "type": "Int!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "iID",
    "variableName": "id",
    "type": "Int!"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "login",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": "__id",
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "PartialInstallationQuery",
  "id": null,
  "text": "query PartialInstallationQuery(\n  $id: Int!\n) {\n  installation(iID: $id) {\n    login\n    ...SetJSONPathForm_installation\n    __id: id\n  }\n}\n\nfragment SetJSONPathForm_installation on Installation {\n  iID\n  __id: id\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "PartialInstallationQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installation",
        "storageKey": null,
        "args": v1,
        "concreteType": "Installation",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "FragmentSpread",
            "name": "SetJSONPathForm_installation",
            "args": null
          },
          v3
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "PartialInstallationQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installation",
        "storageKey": null,
        "args": v1,
        "concreteType": "Installation",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "iID",
            "args": null,
            "storageKey": null
          },
          v3
        ]
      }
    ]
  }
};
})();
(node as any).hash = '8d0f2dc372ad30cadb0fb4c04d807e24';
export default node;
