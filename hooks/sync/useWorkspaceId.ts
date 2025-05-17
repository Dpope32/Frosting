import { useRegistryStore } from '@/store'

export function useWorkspaceId(premium: boolean) {
  const workspaceId = useRegistryStore((s) => s.workspaceId)
  const setWorkspaceId = useRegistryStore((s) => s.setWorkspaceId)
  return { workspaceId: premium ? workspaceId ?? null : null, setWorkspaceId }

}
