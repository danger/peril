export interface Config {
	content_type: string;
	insecure_ssl: string;
	url: string;
}

export interface Hook {
	type: string;
	id: number;
	name: string;
	active: boolean;
	events: string[];
	config: Config;
	updated_at: string;
	created_at: string;
	integration_id: number;
}

export interface RootObject {
	zen: string;
	hook_id: number;
	hook: Hook;
}