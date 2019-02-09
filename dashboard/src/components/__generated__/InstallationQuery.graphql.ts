/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type InstallationQueryVariables = {
    readonly id: number;
};
export type InstallationQueryResponse = {
    readonly installation: ({
        readonly iID: number;
    }) | null;
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
    __id: id
  }
}

fragment Overview_installation on Installation {
  iID
  login
  avatarURL
  __id: id
}

fragment InstallationRules_installation on Installation {
  iID
  repos
  rules
  tasks
  scheduler
  perilSettingsJSONURL
  __id: id
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
  __id: id
}

fragment TaskRunner_installation on Installation {
  iID
  tasks
  __id: id
}

fragment Websocket_installation on Installation {
  iID
  perilSettingsJSONURL
  __id: id
}

fragment Settings_installation on Installation {
  iID
  installationSlackUpdateWebhookURL
  perilSettingsJSONURL
  __id: id
}

fragment EnvVars_installation on Installation {
  iID
  envVars
  __id: id
}

fragment WebhooksHeader_installation on Installation {
  iID
  recordWebhooksUntilTime
  startedRecordingWebhooksTime
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
  "name": "iID",
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
  "name": "InstallationQuery",
  "id": null,
  "text": "query InstallationQuery(\n  $id: Int!\n) {\n  installation(iID: $id) {\n    iID\n    ...Overview_installation\n    ...InstallationRules_installation\n    ...Webhooks_installation\n    ...TaskRunner_installation\n    ...Websocket_installation\n    ...Settings_installation\n    ...EnvVars_installation\n    __id: id\n  }\n}\n\nfragment Overview_installation on Installation {\n  iID\n  login\n  avatarURL\n  __id: id\n}\n\nfragment InstallationRules_installation on Installation {\n  iID\n  repos\n  rules\n  tasks\n  scheduler\n  perilSettingsJSONURL\n  __id: id\n}\n\nfragment Webhooks_installation on Installation {\n  iID\n  ...WebhooksHeader_installation\n  webhooks {\n    edges {\n      node {\n        event\n        iID\n        createdAt\n        eventID\n      }\n    }\n  }\n  __id: id\n}\n\nfragment TaskRunner_installation on Installation {\n  iID\n  tasks\n  __id: id\n}\n\nfragment Websocket_installation on Installation {\n  iID\n  perilSettingsJSONURL\n  __id: id\n}\n\nfragment Settings_installation on Installation {\n  iID\n  installationSlackUpdateWebhookURL\n  perilSettingsJSONURL\n  __id: id\n}\n\nfragment EnvVars_installation on Installation {\n  iID\n  envVars\n  __id: id\n}\n\nfragment WebhooksHeader_installation on Installation {\n  iID\n  recordWebhooksUntilTime\n  startedRecordingWebhooksTime\n  __id: id\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "InstallationQuery",
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
          },
          v3
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "InstallationQuery",
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
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "scheduler",
            "args": null,
            "storageKey": null
          },
          v2,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "avatarURL",
            "args": null,
            "storageKey": null
          },
          v3,
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
            "name": "login",
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
                      v2,
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
          }
        ]
      }
    ]
  }
};
})();
(node as any).hash = 'b94cfd22f880ec7b80980a44d7cfaddd';
export default node;
