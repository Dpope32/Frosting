# Kaiba Nexus Synchronization System

## Overview

The Kaiba Nexus sync system enables seamless data synchronization between multiple devices (e.g., iPhone and iPad) using PocketBase as the backend. The system employs end-to-end encryption to ensure data security across devices in a shared workspace.

## Core Components

### 1. Device Identification (`registrySyncManager.ts`)

Each device generates and maintains a unique device ID that's used for identifying synchronization operations.

- **`generateSyncKey()`** - Creates a device-specific unique identifier
- **`registerDeviceWithWorkspace()`** - Associates a device with a workspace

### 2. Data Export/Import (`exportState.ts`)

Handles the export of app state for synchronization:

- Collects data from all Zustand stores
- Prepares data for encryption
- Formats data for storage in PocketBase

### 3. Workspace Management (`workspace.ts` & `workspaceKey.ts`)

Manages workspace creation, joining, and device registration:

- **Workspace Creation**: Initializes a new workspace with the creating device as owner
- **Invite Mechanism**: Generates shareable invite codes for other devices
- **Workspace Keys**: Manages encryption keys for secure data sharing

### 4. PocketBase Integration (`pocketSync.ts`)

Handles communication with the PocketBase backend:

- Authentication and connection management
- Data retrieval and storage
- Error handling and retry logic

### 5. Snapshot Operations (`snapshotPushPull.ts`)

Core synchronization functions:

- **`pullLatestSnapshot()`**: Retrieves the latest data snapshot from PocketBase
- **`pushSnapshot()`**: Uploads the current device state to PocketBase
- **Conflict Resolution**: Implements "last write wins" with device identification

### 6. Diagnostic Tools (`exportLogs.ts`)

Provides logging and diagnostic capabilities:

- Records sync operations and errors
- Exports logs for troubleshooting

## Sync Workflow

1. **Initialization**:
   - App checks for existing device ID or generates a new one
   - If part of a workspace, retrieves workspace encryption key
- checks inside @app/index.ts if the device is part of a workspace

2. **Pull Operation**:
   - Fetches latest snapshot from PocketBase for the workspace
   - Decrypts data using workspace key
   - Hydrates all app stores with received data
- uses @sync/snapshotPushPull.ts

1. **Push Operation**:
   - Collects state from all Zustand stores
   - Encrypts data with workspace key
   - Uploads to PocketBase with device identifier

2. **Auto-Sync Triggers**:
   - On app startup (after stores are hydrated)
   - When app moves to background
   - When app returns to foreground
   - Manual sync initiated by user

## Security Architecture

- **End-to-End Encryption**: All data is encrypted using shared workspace keys
- **Unique Device IDs**: Ensures proper attribution of sync operations
- **Workspace Isolation**: Data is compartmentalized by workspace


### `debug_logs`

| Field        | Type     | Notes                         |
|--------------|----------|-------------------------------|
| `device_id`  | Text     | Source device identifier      |
| `username`   | Text     | Username (not auth-bound)     |
| `timestamp`  | DateTime | Log creation time             |
| `logs`       | JSON     | Structured log content        |

**Indexes**: `device_id + timestamp (unique)`  
**Rules**: All access open (no restrictions)  
**System fields**: `id`, `created`, `updated`

### `registry_snapshots`

| Field           | Type       | Notes                          |
|------------------|------------|--------------------------------|
| `device_id`      | Text       | Device that pushed the snapshot |
| `snapshot_blob`  | Text       | Encrypted data (likely base64)  |
| `timestamp`      | DateTime   | Snapshot timestamp              |
| `workspace_id`   | Relation   | → `sync_workspaces` (required) |

**Indexes**: `workspace_id (unique)`  
**Rules**: All access open (no restrictions)  
**System fields**: `id`, `created`, `updated`

### `sync_workspaces`

| Field             | Type   | Notes                                |
|------------------|--------|--------------------------------------|
| `owner_device_id` | Text   | Creator's device                     |
| `device_ids`      | JSON   | All participating device IDs         |
| `invite_code`     | Text   | Join code                            |
| `shared_key`      | Text   | Encryption/shared workspace key      |

**Indexes**: `device_ids (unique)`  
**Rules**: All access open (no restrictions)  
**System fields**: `id`, `created`, `updated`