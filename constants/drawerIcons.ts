
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconConfig {name: MaterialIconName | MaterialCommunityIconName; type: 'material' | 'community';}

export const DRAWER_ICONS: Record<string, IconConfig> = {
  '(tabs)/index': { name: 'home' as MaterialIconName, type: 'material' },
  calendar: { name: 'calendar-today' as MaterialIconName, type: 'material' },
  nba: { name: 'sports-basketball' as MaterialIconName, type: 'material' },
  crm: { name: 'person' as MaterialIconName, type: 'material' },
  vault: { name: 'lock' as MaterialIconName, type: 'material' },
  bills: { name: 'attach-money' as MaterialIconName, type: 'material' },
  notes: { name: 'note' as MaterialIconName, type: 'material' },
  habits: { name: 'playlist-check' as MaterialCommunityIconName, type: 'community' },
  projects: { name: 'folder' as MaterialCommunityIconName, type: 'community' },
};