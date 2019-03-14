export enum Hook {
  WILL_CREATE = 'will_create',
  DID_CREATE = 'did_create',
  WILL_UPSERT = 'will_upsert',
  DID_UPSERT = 'did_upsert',
  WILL_UPDATE = 'will_update',
  DID_UPDATE = 'did_update',
  DID_DELETE = 'did_delete',
  WILL_DELETE = 'will_delete'
}