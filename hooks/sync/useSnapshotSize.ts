// hooks/sync/useSnapshotSize.ts
import { useState, useEffect, useCallback } from 'react';
import { getPocketBase } from '@/sync/pocketSync';
import { getCurrentWorkspaceId } from '@/sync/getWorkspace';
import { useUserStore } from '@/store';
import { addSyncLog } from '@/components/sync/syncUtils';

interface SnapshotSizeData {
  bytes: number;
  kb: number;
  mb: number;
  gb: number;
  formatted: {
    bytes: string;
    kb: string;
    mb: string;
    gb: string;
    auto: string; // Best unit automatically chosen
  };
  progressPercentage: number; // For 10GB max
}

interface UseSnapshotSizeReturn {
  data: SnapshotSizeData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const calculateSizeFromBase64 = (base64String: string): number => {
  // Base64 encoding ratio is approximately 4:3 (4 characters for every 3 bytes)
  return Math.floor(base64String.length * 3 / 4);
};

const formatSizeData = (bytes: number): SnapshotSizeData => {
  const kb = bytes / 1024;
  const mb = bytes / (1024 * 1024);
  const gb = bytes / (1024 * 1024 * 1024);
  
  // 10GB max for progress bar
  const maxBytes = 10 * 1024 * 1024 * 1024;
  const progressPercentage = Math.min((bytes / maxBytes) * 100, 100);
  
  // Auto format to best unit
  let autoFormatted: string;
  if (gb >= 1) {
    autoFormatted = `${gb.toFixed(2)} GB`;
  } else if (mb >= 1) {
    autoFormatted = `${mb.toFixed(2)} MB`;
  } else if (kb >= 1) {
    autoFormatted = `${kb.toFixed(2)} KB`;
  } else {
    autoFormatted = `${bytes} bytes`;
  }

  return {
    bytes,
    kb: Math.round(kb * 100) / 100,
    mb: Math.round(mb * 100) / 100,
    gb: Math.round(gb * 10000) / 10000,
    formatted: {
      bytes: `${bytes.toLocaleString()} bytes`,
      kb: `${(Math.round(kb * 100) / 100).toLocaleString()} KB`,
      mb: `${(Math.round(mb * 100) / 100).toLocaleString()} MB`,
      gb: `${(Math.round(gb * 10000) / 10000).toLocaleString()} GB`,
      auto: autoFormatted,
    },
    progressPercentage,
  };
};

export const useSnapshotSize = (workspaceId?: string): UseSnapshotSizeReturn => {
  const [data, setData] = useState<SnapshotSizeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const premium = useUserStore((state) => state.preferences.premium === true);

  const fetchSnapshotSize = useCallback(async () => {
    if (!premium) {
      setError('Premium required for snapshot size');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wsId = workspaceId || await getCurrentWorkspaceId();
      if (!wsId) {
        setError('No workspace ID available');
        setIsLoading(false);
        return;
      }

      addSyncLog('📏 Fetching snapshot size', 'verbose');
      
      const pb = await getPocketBase();
      const response = await pb.collection('registry_snapshots').getList(1, 1, {
        filter: `workspace_id="${wsId}"`,
        sort: '-created',
      });

      if (response.items.length === 0) {
        setError('No snapshots found for workspace');
        setData(null);
        setIsLoading(false);
        return;
      }

      const snapshot = response.items[0];
      const blob = snapshot.snapshot_blob as string;
      
      if (!blob) {
        setError('No snapshot data found');
        setData(null);
        setIsLoading(false);
        return;
      }

      const bytes = calculateSizeFromBase64(blob);
      const sizeData = formatSizeData(bytes);
      
      setData(sizeData);
      addSyncLog(
        `📏 Snapshot size: ${sizeData.formatted.auto}`, 
        'success',
        `Progress: ${sizeData.progressPercentage.toFixed(1)}% of 10GB limit`
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch snapshot size';
      setError(errorMessage);
      addSyncLog('❌ Failed to fetch snapshot size', 'error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, premium]);

  useEffect(() => {
    if (premium) {
      fetchSnapshotSize();
    }
  }, [premium, fetchSnapshotSize]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSnapshotSize,
  };
};