import { StyleSheet, Platform } from 'react-native'
import { isWeb } from 'tamagui'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 12 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 12 : 8,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginLeft: 24,
    paddingVertical: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  teamHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  teamLargeLogo: {
    width: 50,
    height: 50,
    paddingLeft: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    marginLeft: 20,
  },
  listContainer: {
    flex: 1,
    height: '100%',
    minHeight: 200,
  },
  listContent: {
    padding: 8,
    paddingBottom: 20,
  },
  gameCard: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  // Web-specific styles
  webGameCard: {
    width: '30%',
    margin: 8,
    minWidth: 200,
  },
  webGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 8,
    maxWidth: 1800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayDate: {
    color: '#007AFF',
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  teamWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  awayWrapper: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  team: {
    fontSize: 15,
  },
  teamHighlight: {
    color: '#007AFF',
  },
  opposingTeam: {},
  vs: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
    width: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalText: {
    fontSize: 13,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  teamInfoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recordText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#333',
  },
  standingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a84ff',
  },
  // Keeping the original styles
  teamLogoContainer: {
    width: 50,
    height: 50,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#fff',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rankingText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    color: '#0a84ff',
  },

    // Responsive styles for web
    webTeamHeader: {
      paddingHorizontal: 24,
      paddingVertical: 28,
    },
    
    webTeamLargeLogo: {
      width: 90,
      height: 90,

    },
    
    webTeamName: {
      fontSize: 24,
      marginBottom: 0,
    },
    
    webRecordRow: {
      marginTop: 2,
    },
    
    webRecordText: {
      fontSize: 20,
      marginRight: 12,
    },
    
    webRankingText: {
      fontSize: 20,
    },
})