import type { CustomDomainDns } from '$lib/types/custom-domain';
import type { Principal } from '@dfinity/principal';

/**
 * TXT: _canister-id(.subdomain) -> canisterId.to.Text()
 * CNAME: (subdomain) -> ic0.app
 * CNAME: _acme-challenge(.subdomain) -> _acme-challenge.hostname.icp2.io
 */
export const toCustomDomainDns = ({
	domainName,
	canisterId
}: {
	domainName: string;
	canisterId: Principal;
}): CustomDomainDns => {
	const { host: hostname } = new URL(
		`https://${domainName.replace('https://', '').replace('http://', '')}`
	);

	const subdomain = hostname.split('.').slice(0, -2).join('.');

	return {
		hostname,
		subdomain,
		entries: [
			{
				type: 'TXT',
				host: `_canister-id${subdomain !== '' ? `.${subdomain}` : ''}`,
				value: canisterId.toText()
			},
			{
				type: 'CNAME',
				host: subdomain !== '' ? subdomain : undefined,
				value: 'ic0.app'
			},
			{
				type: 'CNAME',
				host: `_acme-challenge${subdomain !== '' ? `.${subdomain}` : ''}`,
				value: `_acme-challenge.${hostname}.icp2.io`
			}
		]
	};
};