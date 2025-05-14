/**
 * @file tests/sync/workspace.test.ts
 * Unit tests for sync/workspace.ts
 *
 * NOTE:
 * • All `jest.mock()` calls are declared BEFORE we import the module-under-test.
 *   This guarantees that the mocks are in place when `sync/workspace.ts`
 *   (which immediately imports `./pocketSync`) is evaluated.
 * • Each mock object is exported with `__esModule: true` so that named ES
 *   imports work correctly when transpiled to CommonJS.
 */

// -----------------------------------------------------------------------------
// External-module mocks
// -----------------------------------------------------------------------------

const mockWriteAsStringAsync = jest.fn();
const mockReadAsStringAsync  = jest.fn();

jest.mock('expo-file-system', () => ({
  __esModule: true,
  documentDirectory : '/mock/doc/',
  writeAsStringAsync: (...args: any[]) => mockWriteAsStringAsync(...args),
  readAsStringAsync : (...args: any[]) => mockReadAsStringAsync(...args),
}));

jest.mock('@/sync/registrySyncManager', () => ({
  __esModule: true,
  generateSyncKey: jest.fn().mockResolvedValue('device-123'),
}));

jest.mock('@/components/sync/syncUtils', () => ({
  __esModule: true,
  addSyncLog: jest.fn(),
}));

// -----------------------------------------------------------------------------
// Mock for getPocketBase (and its collection interface)
// -----------------------------------------------------------------------------
const mockGetOne   = jest.fn();
const mockCreate   = jest.fn();
const mockUpdate   = jest.fn();

const mockPB = {
  collection: jest.fn(() => ({
    getOne : mockGetOne,
    create : mockCreate,
    update : mockUpdate,
  })),
};

jest.mock('../../sync/pocketSync', () => ({
  __esModule: true,
  getPocketBase: jest.fn().mockResolvedValue(mockPB),
}));

// -----------------------------------------------------------------------------
// IMPORT THE MODULE-UNDER-TEST ***AFTER*** WE SET UP THE MOCKS
// -----------------------------------------------------------------------------
import { createOrJoinWorkspace, getCurrentWorkspaceId } from '../../sync/workspace';

// -----------------------------------------------------------------------------
// Helper: deterministic Math.random
// -----------------------------------------------------------------------------
const mockRandom = (value: number) => {
  jest.spyOn(Math, 'random').mockReturnValueOnce(value);
};

// -----------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------
describe('workspace sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Create-new workspace
  // ---------------------------------------------------------------------------
  it('creates a new workspace when no id/invite provided', async () => {
    const fakeWorkspaceId = 'ws-001';

    // Force a predictable invite-code (not asserted for exact value)
    mockRandom(0);
    mockCreate.mockResolvedValue({ id: fakeWorkspaceId });

    const result = await createOrJoinWorkspace();

    // PocketBase create call
    expect(mockPB.collection).toHaveBeenCalledWith('sync_workspaces');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const createArgs = mockCreate.mock.calls[0][0];
    expect(createArgs.owner_device_id).toBe('device-123');
    expect(createArgs.device_ids).toEqual(['device-123']);
    expect(createArgs.invite_code).toHaveLength(8);

    // Local file write
    expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
      '/mock/doc/workspace_id.txt',
      fakeWorkspaceId
    );

    expect(result).toEqual({
      id: fakeWorkspaceId,
      inviteCode: expect.any(String),
    });
  });

  // ---------------------------------------------------------------------------
  // Join existing workspace – success path
  // ---------------------------------------------------------------------------
  it('joins an existing workspace with a valid invite code', async () => {
    const workspaceId = 'existing-ws';
    const inviteCode  = 'INVITE01';

    mockGetOne.mockResolvedValue({ invite_code: inviteCode, device_ids: [] });
    mockUpdate.mockResolvedValue(undefined);

    const result = await createOrJoinWorkspace(workspaceId, inviteCode);

    expect(mockGetOne).toHaveBeenCalledWith(workspaceId);
    expect(mockUpdate).toHaveBeenCalledWith(workspaceId, { 'device_ids+': 'device-123' });
    expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
      '/mock/doc/workspace_id.txt',
      workspaceId
    );
    expect(result).toEqual({ id: workspaceId, inviteCode });
  });

  // ---------------------------------------------------------------------------
  // Join existing workspace – invalid invite
  // ---------------------------------------------------------------------------
  it('throws when invite code is invalid', async () => {
    const workspaceId    = 'existing-ws';
    const providedInvite = 'WRONG123';
    const realInvite     = 'RIGHT123';

    mockGetOne.mockResolvedValue({ invite_code: realInvite, device_ids: [] });

    await expect(
      createOrJoinWorkspace(workspaceId, providedInvite)
    ).rejects.toThrow('Invalid invite code');

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockWriteAsStringAsync).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // getCurrentWorkspaceId – happy path
  // ---------------------------------------------------------------------------
  it('reads workspace id from file', async () => {
    mockReadAsStringAsync.mockResolvedValueOnce('stored-id');

    const id = await getCurrentWorkspaceId();

    expect(mockReadAsStringAsync).toHaveBeenCalledWith('/mock/doc/workspace_id.txt');
    expect(id).toBe('stored-id');
  });

  // ---------------------------------------------------------------------------
  // getCurrentWorkspaceId – file missing
  // ---------------------------------------------------------------------------
  it('returns null when workspace id file is missing', async () => {
    mockReadAsStringAsync.mockRejectedValueOnce(new Error('ENOENT'));

    await expect(getCurrentWorkspaceId()).resolves.toBeNull();
  });
}); 