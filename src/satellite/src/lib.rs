mod assert;
mod controllers;
mod db;
mod guards;
mod impls;
mod list;
mod memory;
mod msg;
mod rules;
mod storage;
mod types;

use crate::controllers::store::get_admin_controllers;
use crate::db::store::{delete_doc, get_doc as get_doc_store, get_docs, insert_doc};
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::Doc;
use crate::guards::caller_is_admin_controller;
use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::rules::store::{
    del_rule_db, del_rule_storage, get_rules_db, get_rules_storage, set_rule_db, set_rule_storage,
};
use crate::rules::types::interface::{DelRule, SetRule};
use crate::rules::types::rules::Rule;
use crate::storage::http::{
    build_encodings, build_headers, create_token, error_response, streaming_strategy,
};
use crate::storage::store::{
    commit_batch, create_batch, create_chunk, delete_asset, delete_assets, delete_domain,
    get_config as get_storage_config, get_content_chunks, get_custom_domains, get_public_asset,
    get_public_asset_for_url, init_certified_assets, list_assets as list_assets_store,
    set_config as set_storage_config, set_domain,
};
use crate::storage::types::domain::{CustomDomains, DomainName};
use crate::storage::types::http::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use crate::storage::types::http_request::PublicAsset;
use crate::storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use crate::storage::types::store::Asset;
use crate::types::core::CollectionKey;
use crate::types::interface::{Config, RulesType};
use crate::types::list::ListResults;
use crate::types::memory::Memory;
use crate::types::state::{HeapState, RuntimeState, State};
use ciborium::{from_reader, into_writer};
use controllers::store::{
    delete_controllers as delete_controllers_store, get_controllers,
    set_controllers as set_controllers_store,
};
use ic_cdk::api::call::arg_data;
use ic_cdk::api::{caller, trap};
use ic_cdk_macros::{export_candid, init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::writer::Writer;
#[allow(unused)]
use ic_stable_structures::Memory as _;
use shared::constants::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use shared::controllers::{assert_max_number_of_controllers, init_controllers};
use shared::types::interface::{DeleteControllersArgs, SegmentArgs, SetControllersArgs};
use shared::types::state::{ControllerScope, Controllers};
use std::mem;
use types::list::ListParams;

#[init]
fn init() {
    let call_arg = arg_data::<(Option<SegmentArgs>,)>().0;
    let SegmentArgs { controllers } = call_arg.unwrap();

    let heap = HeapState {
        controllers: init_controllers(&controllers),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
            runtime: RuntimeState::default(),
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // Serialize the state using CBOR.
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the satellite in pre_upgrade hook.");

    // Write the length of the serialized bytes to memory, followed by the by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut memory = get_memory_upgrades();
    let mut writer = Writer::new(&mut memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(&state_bytes).unwrap()
}

#[post_upgrade]
fn post_upgrade() {
    // The memory offset is 4 bytes because that's the length we used in pre_upgrade to store the length of the memory data for the upgrade.
    // https://github.com/dfinity/stable-structures/issues/104
    const OFFSET: usize = mem::size_of::<u32>();

    let memory: Memory = get_memory_upgrades();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; OFFSET];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes
    let mut state_bytes = vec![0; state_len];
    memory.read(u64::try_from(OFFSET).unwrap(), &mut state_bytes);

    // Deserialize and set the state.
    let state = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");
    STATE.with(|s| *s.borrow_mut() = state);

    init_certified_assets();
}

///
/// Db
///

#[update]
fn set_doc(collection: CollectionKey, key: String, doc: SetDoc) -> Doc {
    let caller = caller();

    let result = insert_doc(caller, collection, key, doc);

    match result {
        Ok(doc) => doc,
        Err(error) => trap(&error),
    }
}

#[query]
fn get_doc(collection: CollectionKey, key: String) -> Option<Doc> {
    let caller = caller();

    let result = get_doc_store(caller, collection, key);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

#[update]
fn del_doc(collection: CollectionKey, key: String, doc: DelDoc) {
    let caller = caller();

    delete_doc(caller, collection, key, doc).unwrap_or_else(|e| trap(&e));
}

#[query]
fn list_docs(collection: CollectionKey, filter: ListParams) -> ListResults<Doc> {
    let caller = caller();

    let result = get_docs(caller, collection, &filter);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

/// Rules

#[query(guard = "caller_is_admin_controller")]
fn list_rules(rules_type: RulesType) -> Vec<(CollectionKey, Rule)> {
    match rules_type {
        RulesType::Db => get_rules_db(),
        RulesType::Storage => get_rules_storage(),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn set_rule(rules_type: RulesType, collection: CollectionKey, rule: SetRule) {
    match rules_type {
        RulesType::Db => set_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        RulesType::Storage => set_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn del_rule(rules_type: RulesType, collection: CollectionKey, rule: DelRule) {
    match rules_type {
        RulesType::Db => del_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        RulesType::Storage => del_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}

///
/// Controllers
///

#[update(guard = "caller_is_admin_controller")]
fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    match controller.scope {
        ControllerScope::Write => {}
        ControllerScope::Admin => {
            let max_controllers = assert_max_number_of_controllers(
                &get_admin_controllers(),
                &controllers,
                MAX_NUMBER_OF_SATELLITE_CONTROLLERS,
            );

            if let Err(err) = max_controllers {
                trap(&err)
            }
        }
    }

    set_controllers_store(&controllers, &controller);
    get_controllers()
}

#[update(guard = "caller_is_admin_controller")]
fn del_controllers(DeleteControllersArgs { controllers }: DeleteControllersArgs) -> Controllers {
    delete_controllers_store(&controllers);
    get_controllers()
}

#[query(guard = "caller_is_admin_controller")]
fn list_controllers() -> Controllers {
    get_controllers()
}

///
/// Config
///

#[update(guard = "caller_is_admin_controller")]
fn set_config(config: Config) {
    set_storage_config(&config.storage);
}

#[update(guard = "caller_is_admin_controller")]
fn get_config() -> Config {
    let storage = get_storage_config();
    Config { storage }
}

///
/// Custom domains
///

#[query(guard = "caller_is_admin_controller")]
fn list_custom_domains() -> CustomDomains {
    get_custom_domains()
}

#[update(guard = "caller_is_admin_controller")]
fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    set_domain(&domain_name, &bn_id).unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_admin_controller")]
fn del_custom_domain(domain_name: DomainName) {
    delete_domain(&domain_name).unwrap_or_else(|e| trap(&e));
}

///
/// Http
///

#[query]
fn http_request(
    HttpRequest {
        method,
        url,
        headers: req_headers,
        body: _,
    }: HttpRequest,
) -> HttpResponse {
    if method != "GET" {
        return error_response(405, "Method Not Allowed.".to_string());
    }

    let result = get_public_asset_for_url(url);

    match result {
        Ok(PublicAsset {
            asset,
            url: requested_url,
        }) => match asset {
            Some((asset, memory)) => {
                let encodings = build_encodings(req_headers);

                for encoding_type in encodings.iter() {
                    if let Some(encoding) = asset.encodings.get(encoding_type) {
                        let headers =
                            build_headers(&requested_url, &asset, encoding, encoding_type);

                        let Asset {
                            key,
                            headers: _,
                            encodings: _,
                            created_at: _,
                            updated_at: _,
                        } = &asset;

                        match headers {
                            Ok(headers) => {
                                let body = get_content_chunks(encoding, 0, &memory);

                                match body {
                                    Some(body) => {
                                        return HttpResponse {
                                            body: body.clone(),
                                            headers: headers.clone(),
                                            status_code: 200,
                                            streaming_strategy: streaming_strategy(
                                                key,
                                                encoding,
                                                encoding_type,
                                                &headers,
                                                &memory,
                                            ),
                                        }
                                    }
                                    None => {
                                        error_response(500, "No chunks found.".to_string());
                                    }
                                }
                            }
                            Err(err) => {
                                return error_response(
                                    405,
                                    ["Permission denied. Invalid headers. ", err].join(""),
                                );
                            }
                        }
                    }
                }

                error_response(500, "No asset encoding found.".to_string())
            }
            None => error_response(404, "No asset found.".to_string()),
        },
        Err(err) => error_response(
            405,
            ["Permission denied. Cannot perform this operation. ", err].join(""),
        ),
    }
}

#[query]
fn http_request_streaming_callback(
    StreamingCallbackToken {
        token,
        headers,
        index,
        sha256: _,
        full_path,
        encoding_type,
        memory: _,
    }: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    let asset = get_public_asset(full_path, token);

    match asset {
        Some((asset, memory)) => {
            let encoding = asset.encodings.get(&encoding_type);

            match encoding {
                Some(encoding) => {
                    let body = get_content_chunks(encoding, index, &memory);

                    match body {
                        Some(body) => StreamingCallbackHttpResponse {
                            token: create_token(
                                &asset.key,
                                index,
                                encoding,
                                &encoding_type,
                                &headers,
                                &memory,
                            ),
                            body: body.clone(),
                        },
                        None => trap("Streamed chunks not found."),
                    }
                }
                None => trap("Streamed asset encoding not found."),
            }
        }
        None => trap("Streamed asset not found."),
    }
}

//
// Storage
//

#[update]
fn init_asset_upload(init: InitAssetKey) -> InitUploadResult {
    let caller = caller();
    let result = create_batch(caller, init);

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

#[update]
fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();

    let result = create_chunk(caller, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(error),
    }
}

#[update]
fn commit_asset_upload(commit: CommitBatch) {
    let caller = caller();

    commit_batch(caller, commit).unwrap_or_else(|e| trap(&e));
}

#[query]
fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    let caller = caller();

    let result = list_assets_store(caller, &collection, &filter);

    match result {
        Ok(result) => result,
        Err(error) => trap(&["Assets cannot be listed: ".to_string(), error].join("")),
    }
}

#[update]
fn del_asset(collection: CollectionKey, full_path: String) {
    let caller = caller();

    let result = delete_asset(caller, &collection, full_path);

    match result {
        Ok(_) => (),
        Err(error) => trap(&["Asset cannot be deleted: ", &error].join("")),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn del_assets(collection: CollectionKey) {
    let result = delete_assets(&collection);

    match result {
        Ok(_) => (),
        Err(error) => trap(&["Assets cannot be deleted: ", &error].join("")),
    }
}

/// Mgmt

#[query]
fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Generate did files

export_candid!();
