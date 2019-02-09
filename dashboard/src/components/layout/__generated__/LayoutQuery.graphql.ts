/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type LayoutQueryVariables = {};
export type LayoutQueryResponse = {
    readonly me: ({
        readonly name: string;
        readonly installations: {
            readonly edges: ReadonlyArray<({
                readonly node: ({
                    readonly login: string;
                    readonly iID: number;
                }) | null;
            }) | null> | null;
        };
        readonly installationsToSetUp: {
            readonly edges: ReadonlyArray<({
                readonly node: ({
                    readonly iID: number;
                    readonly login: string;
                }) | null;
            }) | null> | null;
        };
    }) | null;
};



/*
query LayoutQuery {
  me {
    name
    installations {
      edges {
        node {
          login
          iID
          __id: id
        }
      }
    }
    installationsToSetUp {
      edges {
        node {
          iID
          login
          __id: id
        }
      }
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "login",
  "args": null,
  "storageKey": null
},
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "iID",
  "args": null,
  "storageKey": null
},
v2 = {
  "kind": "ScalarField",
  "alias": "__id",
  "name": "id",
  "args": null,
  "storageKey": null
},
v3 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "me",
    "storageKey": null,
    "args": null,
    "concreteType": "User",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "name",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installations",
        "storageKey": null,
        "args": null,
        "concreteType": "InstallationConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "InstallationEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Installation",
                "plural": false,
                "selections": [
                  v0,
                  v1,
                  v2
                ]
              }
            ]
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "installationsToSetUp",
        "storageKey": null,
        "args": null,
        "concreteType": "PartialInstallationConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "PartialInstallationEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "PartialInstallation",
                "plural": false,
                "selections": [
                  v1,
                  v0,
                  v2
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "LayoutQuery",
  "id": null,
  "text": "query LayoutQuery {\n  me {\n    name\n    installations {\n      edges {\n        node {\n          login\n          iID\n          __id: id\n        }\n      }\n    }\n    installationsToSetUp {\n      edges {\n        node {\n          iID\n          login\n          __id: id\n        }\n      }\n    }\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "LayoutQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": v3
  },
  "operation": {
    "kind": "Operation",
    "name": "LayoutQuery",
    "argumentDefinitions": [],
    "selections": v3
  }
};
})();
(node as any).hash = '7037bbe8980a4e942c5d956ec48bb1e3';
export default node;
