export interface Account {
	login: string;
	id: number;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

export interface Installation {
	id: number;
	account: Account;
	access_tokens_url: string;
	repositories_url: string;
	html_url: string;
}

export interface Repositories_added {
	id: number;
	name: string;
	full_name: string;
}

export interface Sender {
	login: string;
	id: number;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

export interface RootObject {
	action: string;
	installation: Installation;
	repository_selection: string;
	repositories_added: Repositories_added[];
	repositories_removed: any[];
	sender: Sender;
}