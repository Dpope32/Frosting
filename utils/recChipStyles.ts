import { VaultRecommendationCategory } from '@/constants/recommendations/VaultRecommendations';
import { BillRecommendationCategory } from '@/constants/recommendations/BillRecommendations';

export type ReccomendationCategory = VaultRecommendationCategory | BillRecommendationCategory ;


export const getChipStyle = (category: ReccomendationCategory) => {
    switch (category) {
      case 'Social Media':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          textColor: '#3b82f6',
          fontFamily: '$body'
        }
      case 'Misc':
        return {
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          textColor: '#8b5cf6',
          fontFamily: '$body'
        }
      case 'Shopping':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          textColor: '#10b981',
          fontFamily: '$body'
        }
      case 'Work':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          textColor: '#ef4444',
          fontFamily: '$body'
        }
        case 'Housing':
          return {
            backgroundColor: "rgba(16, 185, 129, 0.15)", // green
            borderColor: "rgba(16, 185, 129, 0.3)",
            iconName: "home-outline" as const,
            iconColor: "#10b981",
            textColor: "#10b981"
          }
        case 'Transportation':
          return {
            backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
            borderColor: "rgba(59, 130, 246, 0.3)",
            iconName: "car-outline" as const,
            iconColor: "#3b82f6",
            textColor: "#3b82f6"
          }
        case 'Subscriptions':
          return {
            backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
            borderColor: "rgba(139, 92, 246, 0.3)",
            iconName: "play-circle-outline" as const,
            iconColor: "#8b5cf6",
            textColor: "#8b5cf6"
          }
        case 'Insurance':
          return {
            backgroundColor: "rgba(239, 68, 68, 0.15)", // red
            borderColor: "rgba(239, 68, 68, 0.3)",
            iconName: "shield-outline" as const,
            iconColor: "#ef4444",
            textColor: "#ef4444"
          }
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
          textColor: '#6b7280',
          fontFamily: '$body',
        };
    }
  };