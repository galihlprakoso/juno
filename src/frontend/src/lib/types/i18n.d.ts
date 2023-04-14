/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
	close: string;
	back: string;
	menu: string;
	copy: string;
	toggle: string;
	loading: string;
	status: string;
	sign_out: string;
	sign_in: string;
	light_off: string;
	light_on: string;
	submit: string;
	home: string;
	help: string;
	controllers: string;
	continue: string;
	not_logged_in: string;
	ready: string;
	yes: string;
	no: string;
	ok: string;
	cancel: string;
	apply: string;
	language: string;
	user_menu: string;
}

interface I18nCanisters {
	top_up: string;
	cycles: string;
	top_up_in_progress: string;
	amount: string;
	top_up_title: string;
	additional_cycles: string;
	top_up_info: string;
}

interface I18nSign_in {
	title: string;
	overview_1: string;
	overview_2: string;
	overview_3: string;
	internet_identity: string;
}

interface I18nSatellites {
	title: string;
	launch: string;
	open: string;
	create: string;
	satellite: string;
	ready: string;
	initializing: string;
	start: string;
	description: string;
	name: string;
	enter_name: string;
	create_satellite_price: string;
	loading_satellites: string;
}

interface I18nMission_control {
	title: string;
	overview: string;
	id: string;
	account_identifier: string;
	balance: string;
	credits: string;
	dev_id: string;
	transactions: string;
}

interface I18nOverview {
	title: string;
}

interface I18nAuthentication {
	title: string;
	users: string;
	methods: string;
}

interface I18nDatastore {
	title: string;
	data: string;
	documents: string;
}

interface I18nStorage {
	title: string;
	assets: string;
}

interface I18nHosting {
	title: string;
	success: string;
	configure: string;
	add_records: string;
	dns_notes: string;
	delete_custom_domain: string;
	before_continuing: string;
	delete_are_you_sure: string;
	delete: string;
	edit: string;
	type: string;
	host: string;
	value: string;
	config_in_progress: string;
	add_custom_domain: string;
	description: string;
	custom_domain: string;
	default_domain: string;
	domain: string;
	status: string;
	pendingorder: string;
	pendingchallengeresponse: string;
	pendingacmeapproval: string;
	available: string;
	failed: string;
}

interface I18nCli {
	title: string;
	sign_in: string;
	add: string;
	select_all: string;
	unselect_all: string;
	profile: string;
	segments: string;
	profile_placeholder: string;
}

interface I18nErrors {
	no_mission_control: string;
	cli_missing_params: string;
	cli_missing_selection: string;
	cli_unexpected_error: string;
	satellite_name_missing: string;
	satellite_unexpected_error: string;
	satellite_no_found: string;
	ledger_balance_credits: string;
	hosting_missing_domain_name: string;
	hosting_invalid_url: string;
	hosting_missing_dns_configuration: string;
	hosting_configuration_issues: string;
	hosting_loading_errors: string;
	hosting_no_custom_domain: string;
	hosting_delete_custom_domain: string;
	controllers_listing: string;
	controllers_no_selection: string;
	controllers_delete: string;
	observatory_get_unexpected_error: string;
	observatory_set_unexpected_error: string;
}

interface I18nDocument {
	owner: string;
	created: string;
	updated: string;
	data: string;
	no_match: string;
}

interface I18nAsset {
	owner: string;
	token: string;
	headers: string;
	created: string;
	updated: string;
	no_match: string;
}

interface I18nAdmin {
	mission_control_new_version: string;
	satellite_new_version: string;
}

interface I18nControllers {
	title: string;
	profile: string;
	delete: string;
	info: string;
	delete_question: string;
	controller_id: string;
	no_delete: string;
	more_delete: string;
}

interface I18nCollections {
	title: string;
	details: string;
	key: string;
	key_placeholder: string;
	read_permission: string;
	write_permission: string;
	max_size: string;
	max_size_placeholder: string;
	public: string;
	private: string;
	managed: string;
	controllers: string;
	empty: string;
}

interface I18nSort {
	title: string;
	keys: string;
	created_at: string;
	updated_at: string;
	sort_by_field: string;
	sort_results: string;
	ascending: string;
	descending: string;
}

interface I18nFilter {
	title: string;
	filter_keys: string;
	filter_owner: string;
	placeholder_keys: string;
	placeholder_owners: string;
}

interface I18nUsers {
	identifier: string;
	provider: string;
	created: string;
	updated: string;
	empty: string;
	enabled: string;
}

interface I18nObservatory {
	title: string;
	overview: string;
	loading: string;
	monitoring: string;
	enabled: string;
	disabled: string;
	submit_enable: string;
	submit_disable: string;
	email_notifications: string;
	email_notifications_placeholder: string;
	cycles_threshold: string;
	cycles_threshold_placeholder: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	canisters: I18nCanisters;
	sign_in: I18nSign_in;
	satellites: I18nSatellites;
	mission_control: I18nMission_control;
	overview: I18nOverview;
	authentication: I18nAuthentication;
	datastore: I18nDatastore;
	storage: I18nStorage;
	hosting: I18nHosting;
	cli: I18nCli;
	errors: I18nErrors;
	document: I18nDocument;
	asset: I18nAsset;
	admin: I18nAdmin;
	controllers: I18nControllers;
	collections: I18nCollections;
	sort: I18nSort;
	filter: I18nFilter;
	users: I18nUsers;
	observatory: I18nObservatory;
}
