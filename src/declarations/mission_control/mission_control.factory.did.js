// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const Orbiter = IDL.Record({
		updated_at: IDL.Nat64,
		orbiter_id: IDL.Principal,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64
	});
	const Satellite = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal
	});
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null
	});
	const Controller = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const CanisterStatusType = IDL.Variant({
		stopped: IDL.Null,
		stopping: IDL.Null,
		running: IDL.Null
	});
	const DefiniteCanisterSettings = IDL.Record({
		freezing_threshold: IDL.Nat,
		controllers: IDL.Vec(IDL.Principal),
		memory_allocation: IDL.Nat,
		compute_allocation: IDL.Nat
	});
	const CanisterStatusResponse = IDL.Record({
		status: CanisterStatusType,
		memory_size: IDL.Nat,
		cycles: IDL.Nat,
		settings: DefiniteCanisterSettings,
		idle_cycles_burned_per_day: IDL.Nat,
		module_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const SegmentStatus = IDL.Record({
		id: IDL.Principal,
		status: CanisterStatusResponse,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		status_at: IDL.Nat64
	});
	const Result = IDL.Variant({ Ok: SegmentStatus, Err: IDL.Text });
	const SetController = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const CronJobStatusesConfig = IDL.Record({
		enabled: IDL.Bool,
		cycles_threshold: IDL.Opt(IDL.Nat64)
	});
	const StatusesArgs = IDL.Record({
		mission_control_cycles_threshold: IDL.Opt(IDL.Nat64),
		orbiters: IDL.Vec(IDL.Tuple(IDL.Principal, CronJobStatusesConfig)),
		satellites: IDL.Vec(IDL.Tuple(IDL.Principal, CronJobStatusesConfig)),
		cycles_threshold: IDL.Opt(IDL.Nat64)
	});
	const SegmentsStatuses = IDL.Record({
		orbiters: IDL.Opt(IDL.Vec(Result)),
		satellites: IDL.Opt(IDL.Vec(Result)),
		mission_control: Result
	});
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	return IDL.Service({
		add_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		add_satellites_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		create_orbiter: IDL.Func([IDL.Opt(IDL.Text)], [Orbiter], []),
		create_satellite: IDL.Func([IDL.Text], [Satellite], []),
		del_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		del_orbiters_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		del_satellites_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		get_user: IDL.Func([], [IDL.Principal], ['query']),
		list_mission_control_controllers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			['query']
		),
		list_mission_control_statuses: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Nat64, Result))], ['query']),
		list_orbiter_statuses: IDL.Func(
			[IDL.Principal],
			[IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat64, Result)))],
			['query']
		),
		list_orbiters: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Orbiter))], ['query']),
		list_satellite_statuses: IDL.Func(
			[IDL.Principal],
			[IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat64, Result)))],
			['query']
		),
		list_satellites: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Satellite))], ['query']),
		remove_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		remove_satellites_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)],
			[],
			[]
		),
		set_metadata: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [], []),
		set_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal), SetController], [], []),
		set_orbiter_metadata: IDL.Func(
			[IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[Orbiter],
			[]
		),
		set_orbiters_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal), SetController],
			[],
			[]
		),
		set_satellite_metadata: IDL.Func(
			[IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[Satellite],
			[]
		),
		set_satellites_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal), SetController],
			[],
			[]
		),
		status: IDL.Func([StatusesArgs], [SegmentsStatuses], []),
		top_up: IDL.Func([IDL.Principal, Tokens], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};
