/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
type SetJSONPathForm_installation$ref = any;
export type PartialInstallationQueryVariables = {
    readonly id: number;
};
export type PartialInstallationQueryResponse = {
    readonly installation: {
        readonly login: string;
        readonly " $fragmentRefs": SetJSONPathForm_installation$ref;
    } | null;
};
export type PartialInstallationQuery = {
    readonly response: PartialInstallationQueryResponse;
    readonly variables: PartialInstallationQueryVariables;
};



/*
query PartialInstallationQuery(
  $id: Int!
) {
  installation(iID: $id) {
    login
    ...SetJSONPathForm_installation
    id
  }
}

fragment SetJSONPathForm_installation on Installation {
  iID
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
    "variableName": "id"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "login",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "PartialInstallationQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installation",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "Installation",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "FragmentSpread",
            "name": "SetJSONPathForm_installation",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "PartialInstallationQuery",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installation",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "Installation",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
            "name": "id",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "query",
    "name": "PartialInstallationQuery",
    "id": null,
    "text": "query PartialInstallationQuery(\n  $id: Int!\n) {\n  installation(iID: $id) {\n    login\n    ...SetJSONPathForm_installation\n    id\n  }\n}\n\nfragment SetJSONPathForm_installation on Installation {\n  iID\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = '8d0f2dc372ad30cadb0fb4c04d807e24';
export default node;
