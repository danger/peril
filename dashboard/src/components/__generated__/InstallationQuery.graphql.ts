/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
type EnvVars_installation$ref = any;
type InstallationRules_installation$ref = any;
type Overview_installation$ref = any;
type Settings_installation$ref = any;
type TaskRunner_installation$ref = any;
type Webhooks_installation$ref = any;
type Websocket_installation$ref = any;
export type InstallationQueryVariables = {
    readonly id: number;
};
export type InstallationQueryResponse = {
    readonly installation: {
        readonly iID: number;
        readonly " $fragmentRefs": Overview_installation$ref & InstallationRules_installation$ref & Webhooks_installation$ref & TaskRunner_installation$ref & Websocket_installation$ref & Settings_installation$ref & EnvVars_installation$ref;
    } | null;
};
export type InstallationQuery = {
    readonly response: InstallationQueryResponse;
    readonly variables: InstallationQueryVariables;
};



/*
query InstallationQuery(
  $id: Int!
) {
  installation(iID: $id) {
    iID
    ...Overview_installation
    ...InstallationRules_installation
    ...Webhooks_installation
    ...TaskRunner_installation
    ...Websocket_installation
    ...Settings_installation
    ...EnvVars_installation
    id
  }
}

fragment Overview_installation on Installation {
  iID
  login
  avatarURL
}

fragment InstallationRules_installation on Installation {
  iID
  repos
  rules
  tasks
  scheduler
  perilSettingsJSONURL
}

fragment Webhooks_installation on Installation {
  iID
  ...WebhooksHeader_installation
  webhooks {
    edges {
      node {
        event
        iID
        createdAt
        eventID
      }
    }
  }
}

fragment TaskRunner_installation on Installation {
  iID
  tasks
}

fragment Websocket_installation on Installation {
  iID
  perilSettingsJSONURL
}

fragment Settings_installation on Installation {
  iID
  installationSlackUpdateWebhookURL
  perilSettingsJSONURL
}

fragment EnvVars_installation on Installation {
  iID
  envVars
}

fragment WebhooksHeader_installation on Installation {
  iID
  recordWebhooksUntilTime
  startedRecordingWebhooksTime
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
  "name": "iID",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "InstallationQuery",
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
            "name": "Overview_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "InstallationRules_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "Webhooks_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "TaskRunner_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "Websocket_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "Settings_installation",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "EnvVars_installation",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "InstallationQuery",
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
            "name": "login",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "avatarURL",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "repos",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "rules",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "tasks",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "scheduler",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "perilSettingsJSONURL",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "recordWebhooksUntilTime",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "startedRecordingWebhooksTime",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "webhooks",
            "storageKey": null,
            "args": null,
            "concreteType": "RecordedWebhookConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "RecordedWebhookEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "RecordedWebhook",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "event",
                        "args": null,
                        "storageKey": null
                      },
                      (v2/*: any*/),
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "createdAt",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "eventID",
                        "args": null,
                        "storageKey": null
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "installationSlackUpdateWebhookURL",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "envVars",
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
    "name": "InstallationQuery",
    "id": null,
    "text": "query InstallationQuery(\n  $id: Int!\n) {\n  installation(iID: $id) {\n    iID\n    ...Overview_installation\n    ...InstallationRules_installation\n    ...Webhooks_installation\n    ...TaskRunner_installation\n    ...Websocket_installation\n    ...Settings_installation\n    ...EnvVars_installation\n    id\n  }\n}\n\nfragment Overview_installation on Installation {\n  iID\n  login\n  avatarURL\n}\n\nfragment InstallationRules_installation on Installation {\n  iID\n  repos\n  rules\n  tasks\n  scheduler\n  perilSettingsJSONURL\n}\n\nfragment Webhooks_installation on Installation {\n  iID\n  ...WebhooksHeader_installation\n  webhooks {\n    edges {\n      node {\n        event\n        iID\n        createdAt\n        eventID\n      }\n    }\n  }\n}\n\nfragment TaskRunner_installation on Installation {\n  iID\n  tasks\n}\n\nfragment Websocket_installation on Installation {\n  iID\n  perilSettingsJSONURL\n}\n\nfragment Settings_installation on Installation {\n  iID\n  installationSlackUpdateWebhookURL\n  perilSettingsJSONURL\n}\n\nfragment EnvVars_installation on Installation {\n  iID\n  envVars\n}\n\nfragment WebhooksHeader_installation on Installation {\n  iID\n  recordWebhooksUntilTime\n  startedRecordingWebhooksTime\n}\n",
    "metadata": {}
  }
};
})();
(node as any).hash = 'b94cfd22f880ec7b80980a44d7cfaddd';
export default node;
