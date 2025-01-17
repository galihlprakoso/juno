import type { SatelliteIdText } from '$lib/types/satellite';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

export interface ReleaseVersion {
	current: string | undefined;
	release: string | undefined;
}

export interface ReleasesVersion {
	satellites: Record<SatelliteIdText, ReleaseVersion | undefined>;
	missionControl: ReleaseVersion | undefined;
	orbiter: ReleaseVersion | undefined;
}

export interface VersionStore extends Readable<ReleasesVersion> {
	setMissionControl: (version: ReleaseVersion) => void;
	setSatellite: (params: {
		satelliteId: SatelliteIdText;
		version: ReleaseVersion | undefined;
	}) => void;
	setOrbiter: (version: ReleaseVersion) => void;
	reset: () => void;
}

const initVersionStore = (): VersionStore => {
	const INITIAL = {
		satellites: {},
		missionControl: undefined,
		orbiter: undefined
	} as const;

	const { subscribe, update, set } = writable<ReleasesVersion>(INITIAL);

	return {
		subscribe,

		setMissionControl(version: ReleaseVersion) {
			update((state) => ({
				...state,
				missionControl: version
			}));
		},

		setSatellite({ satelliteId, version }) {
			update((state) => ({
				...state,
				satellites: {
					...state.satellites,
					[satelliteId]: version
				}
			}));
		},

		setOrbiter(version: ReleaseVersion) {
			update((state) => ({
				...state,
				orbiter: version
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const versionStore = initVersionStore();
