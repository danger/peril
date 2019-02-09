/* tslint:disable */

import { ConcreteFragment } from "relay-runtime";
export type InstallationRules_installation = {
    readonly iID: number;
    readonly repos: any;
    readonly rules: any;
    readonly tasks: any;
    readonly scheduler: any;
    readonly perilSettingsJSONURL: string;
};



const node: ConcreteFragment = {
  "kind": "Fragment",
  "name": "InstallationRules_installation",
  "type": "Installation",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
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
      "alias": "__id",
      "name": "id",
      "args": null,
      "storageKey": null
    }
  ]
};
(node as any).hash = 'a4457047b69e823ccbf3c4892ae6e11a';
export default node;
