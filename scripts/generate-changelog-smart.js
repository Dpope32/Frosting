const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to read app.json and get the current version
function getCurrentVersion() {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return appJson.expo.version;
}

// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Function to get recent git commits
function getRecentCommits(count = 15) {
  try {
    const output = execSync(`git log -${count} --pretty=format:"%s" --no-merges`).toString();
    return output.split('\n').filter(msg => msg.trim() !== '');
  } catch (error) {
    console.warn('Warning: Unable to get git commits. Using default placeholders.');
    return ['Update app features', 'Fix bugs', 'Improve performance'];
  }
}

// Function to get changed files since last commit
function getChangedFiles() {
  try {
    // Try to get files changed in the last commit first
    return execSync('git diff --name-only HEAD~1 HEAD').toString()
      .split('\n')
      .filter(file => file.trim() !== '');
  } catch (error) {
    try {
      // If that fails, try to get unstaged changes
      return execSync('git diff --name-only').toString()
        .split('\n')
        .filter(file => file.trim() !== '');
    } catch (error2) {
      console.warn('Warning: Unable to get changed files. Using empty list.');
      return [];
    }
  }
}

// Learn from existing changelog entries
function learnFromExistingChangelog() {
  try {
    const changelogPath = path.join(__dirname, '..', 'constants', 'changelog.ts');
    const changelogContent = fs.readFileSync(changelogPath, 'utf8');
    
    // Extract all note strings using a regex pattern
    const notePattern = /notes:\s*['"](.+?)['"]/g;
    const noteMatches = [...changelogContent.matchAll(notePattern)];
    const notes = noteMatches.map(match => match[1]);
    
    // Extract all bullet points
    const bulletPattern = /['"](.+?)['"]/g;
    const bulletMatches = [...changelogContent.matchAll(/bullets:\s*\[([\s\S]+?)\]/g)];
    
    let allBullets = [];
    if (bulletMatches.length > 0) {
      for (const match of bulletMatches) {
        const bulletSection = match[1];
        const bulletItems = [...bulletSection.matchAll(bulletPattern)];
        allBullets = allBullets.concat(bulletItems.map(b => b[1]));
      }
    }
    
    // Analyze patterns in notes
    const notePatterns = {
      endsWithExclamation: notes.filter(n => n.endsWith('!')).length / (notes.length || 1),
      containsAnd: notes.filter(n => n.includes(' and ')).length / (notes.length || 1),
      avgLength: notes.reduce((sum, n) => sum + n.length, 0) / (notes.length || 1),
      startsWithVerb: notes.filter(n => /^[A-Z][a-z]+ed|^[A-Z][a-z]+ing/.test(n)).length / (notes.length || 1),
      hasEmoji: notes.filter(n => /[\u{1F300}-\u{1F6FF}]/u.test(n)).length / (notes.length || 1),
      isTechnical: notes.filter(n => /API|UI|UX|performance|system|core|engine/i.test(n)).length / (notes.length || 1),
      isCasual: notes.filter(n => /cool|awesome|nice|sweet|fun|exciting/i.test(n)).length / (notes.length || 1),
    };
    
    // Analyze bullet point patterns
    const bulletPatterns = {
      avgLength: allBullets.reduce((sum, b) => sum + b.length, 0) / (allBullets.length || 1),
      usesPast: allBullets.filter(b => /^[A-Z][a-z]+ed/.test(b)).length / (allBullets.length || 1),
      usesImperative: allBullets.filter(b => /^[A-Z][a-z]+[ ,]/.test(b) && !/^[A-Z][a-z]+ed/.test(b)).length / (allBullets.length || 1),
      hasEmoji: allBullets.filter(b => /[\u{1F300}-\u{1F6FF}]/u.test(b)).length / (allBullets.length || 1),
    };
    
    // Common starting words in notes
    const noteWords = notes.map(n => n.split(' ')[0]);
    const commonNoteStarters = noteWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    // Common starting words in bullets
    const bulletWords = allBullets.map(b => b.split(' ')[0]);
    const commonBulletStarters = bulletWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    return {
      notePatterns,
      bulletPatterns,
      commonNoteStarters,
      commonBulletStarters,
      exampleNotes: notes.slice(0, 5),
      exampleBullets: allBullets.slice(0, 10)
    };
  } catch (error) {
    console.warn('Warning: Unable to learn from existing changelog. Using defaults.');
    return {
      notePatterns: {},
      bulletPatterns: {},
      commonNoteStarters: {},
      commonBulletStarters: {},
      exampleNotes: [],
      exampleBullets: []
    };
  }
}

// Apply learned patterns to create a title in the user's style
function createPersonalizedTitle(commits, learningData) {
  const { notePatterns, commonNoteStarters, exampleNotes } = learningData;
  
  // If we have no commits, use a generic title
  if (!commits.length) {
    return "App Updates & Improvements";
  }
  
  // Get the most significant commit (usually the first one, or look for keywords)
  let mainCommit = commits[0];
  const importantCommits = commits.filter(c => 
    c.toLowerCase().includes('feature') || 
    c.toLowerCase().includes('major') || 
    c.toLowerCase().includes('new')
  );
  
  if (importantCommits.length) {
    mainCommit = importantCommits[0];
  }
  
  // Clean up the commit message
  let title = mainCommit
    .replace(/^(fix|chore|feat|feat\(.*\)|feature|doc|style|refactor|perf|test|build):\s*/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // If the commit ends with a period, remove it
  if (title.endsWith('.')) {
    title = title.slice(0, -1);
  }
  
  // If the user likes exclamation marks, add one if there isn't one already
  if (notePatterns.endsWithExclamation > 0.3 && !title.endsWith('!')) {
    title += '!';
  }
  
  // If the common starters exist and the title doesn't start with one, consider prepending a common starter
  if (Object.keys(commonNoteStarters).length && exampleNotes.length) {
    // Find the most common starter
    const starter = Object.entries(commonNoteStarters)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0];
      
    // If it's a verb and the title doesn't already start with it, consider prepending
    if (starter && /^[A-Z][a-z]+ed$/.test(starter) && !title.startsWith(starter)) {
      // If the user tends to use past tense verbs
      if (notePatterns.startsWithVerb > 0.3) {
        title = `${starter} ${title.charAt(0).toLowerCase() + title.slice(1)}`;
      }
    }
  }
  
  // If the user's notes are generally shorter, truncate if necessary
  if (notePatterns.avgLength < 25 && title.length > 30) {
    title = title.split(' ').slice(0, 4).join(' ');
    if (!title.endsWith('!') && !title.endsWith('?') && !title.endsWith('.')) {
      title += notePatterns.endsWithExclamation > 0.3 ? '!' : '';
    }
  }
  
  return title;
}

// Create personalized bullet points
function createPersonalizedBullets(commits, changedAreas, learningData) {
  const { bulletPatterns, commonBulletStarters } = learningData;
  const bulletPoints = [];
  
  // Extract verbs from common starters
  const commonVerbs = Object.keys(commonBulletStarters)
    .filter(word => /^[A-Z][a-z]+ed$/.test(word) || /^[A-Z][a-z]+$/.test(word));
  
  // If we have no common verbs, use these defaults
  const defaultVerbs = ['Fixed', 'Added', 'Improved', 'Updated', 'Enhanced'];
  const verbsToUse = commonVerbs.length ? commonVerbs : defaultVerbs;
  
  // Process commits to create bullets
  for (let i = 0; i < Math.min(commits.length, 5); i++) {
    let commit = commits[i]
      .replace(/^(fix|chore|feat|feat\(.*\)|feature|doc|style|refactor|perf|test|build):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim();
    
    // Skip very short or meaningless commits
    if (commit.length < 5 || /^merge|^update|^wip/i.test(commit)) continue;
    
    // Capitalize first letter
    commit = commit.charAt(0).toUpperCase() + commit.slice(1);
    
    // If it already starts with a common verb, use it as is (with length limit)
    const alreadyHasVerb = verbsToUse.some(verb => commit.startsWith(verb));
    
    if (alreadyHasVerb) {
      // If bullet points tend to be short, limit length
      if (bulletPatterns.avgLength < 40) {
        commit = commit.split(' ').slice(0, 5).join(' ');
      }
      
      bulletPoints.push(commit);
    } else {
      // Determine appropriate verb based on commit content
      let verb = 'Updated'; // default
      
      if (/fix|bug|issue|problem|error|crash/i.test(commit)) {
        verb = 'Fixed';
      } else if (/add|new|creat|introduc/i.test(commit)) {
        verb = 'Added';
      } else if (/improv|enhanc|better|optimiz|upgrad/i.test(commit)) {
        verb = 'Improved';
      } else if (/refactor|clean|restructur/i.test(commit)) {
        verb = 'Refactored';
      } else if (/chang|modif/i.test(commit)) {
        verb = 'Changed';
      }
      
      // Truncate to make it more concise
      const commitText = commit.split(' ').slice(0, 4).join(' ');
      
      // Add the verb at the beginning
      bulletPoints.push(`${verb} ${commitText.charAt(0).toLowerCase() + commitText.slice(1)}`);
    }
  }
  
  // Add area-specific bullets if we still need more
  if (bulletPoints.length < 3) {
    Object.keys(changedAreas).forEach(area => {
      if (bulletPoints.length >= 5) return;
      
      const areaVerbs = {
        'components': 'Enhanced',
        'screens': 'Improved',
        'services': 'Optimized',
        'utils': 'Updated',
        'assets': 'Refreshed',
        'styles': 'Styled',
        'tests': 'Tested'
      };
      
      const verb = areaVerbs[area] || 'Updated';
      bulletPoints.push(`${verb} ${area} functionality`);
    });
  }
  
  // If we still need bullets, add generic ones
  if (bulletPoints.length < 3) {
    const genericBullets = [
      'Fixed minor bugs',
      'Improved performance',
      'Updated dependencies',
      'Enhanced user experience',
      'Added small tweaks'
    ];
    
    for (let i = 0; i < genericBullets.length && bulletPoints.length < 3; i++) {
      bulletPoints.push(genericBullets[i]);
    }
  }
  
  // Return unique bullets (no duplicates)
  return [...new Set(bulletPoints)].slice(0, 5);
}

// Function to suggest notes and bullets based on commits and changed files
function suggestChangelog() {
  const commits = getRecentCommits();
  const changedFiles = getChangedFiles();
  
  // Group files by directory to understand what areas changed
  const changedAreas = changedFiles.reduce((areas, file) => {
    const dir = path.dirname(file).split('/')[0];
    if (!areas[dir]) areas[dir] = [];
    areas[dir].push(file);
    return areas;
  }, {});
  
  // Learn from existing changelog entries
  const learningData = learnFromExistingChangelog();
  
  // Generate personalized note and bullets
  const suggestedNote = createPersonalizedTitle(commits, learningData);
  const suggestedBullets = createPersonalizedBullets(commits, changedAreas, learningData);
  
  return {
    suggestedNote,
    suggestedBullets
  };
}

// Function to prompt for notes and bullet points with suggestions
function promptForChangelog() {
  return new Promise((resolve) => {
    const { suggestedNote, suggestedBullets } = suggestChangelog();
    
    console.log('\nBased on your recent changes, here are some suggestions:');
    console.log(`\nSuggested note: "${suggestedNote}"`);
    console.log('\nSuggested bullet points:');
    suggestedBullets.forEach((bullet, index) => {
      console.log(`${index + 1}. ${bullet}`);
    });
    
    rl.question('\nUse these suggestions? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.close();
        resolve({ notes: suggestedNote, bullets: suggestedBullets });
      } else {
        rl.question('Enter changelog notes: ', (notes) => {
          const bullets = [];
          
          function promptForBullet() {
            rl.question('Enter bullet point (empty to finish): ', (bullet) => {
              if (bullet.trim() === '') {
                rl.close();
                resolve({ notes, bullets });
              } else {
                bullets.push(bullet);
                promptForBullet();
              }
            });
          }
          
          promptForBullet();
        });
      }
    });
  });
}

// Function to update the changelog.ts file
function updateChangelogFile(version, date, notes, bullets) {
  const changelogPath = path.join(__dirname, '..', 'constants', 'changelog.ts');
  let changelogContent = fs.readFileSync(changelogPath, 'utf8');
  
  // Create new changelog entry
  const newEntry = `  {
    version: '${version}',
    date: '${date}',
    notes: '${notes}',
    bullets: [
${bullets.map(bullet => `      '${bullet}'`).join(',\n')}
    ],
  },`;
  
  // Insert the new entry at the top of the CHANGELOG array
  const insertPosition = changelogContent.indexOf('export const CHANGELOG = [') + 'export const CHANGELOG = ['.length;
  
  const updatedContent = 
    changelogContent.slice(0, insertPosition) + 
    '\n' + newEntry + 
    changelogContent.slice(insertPosition);
  
  fs.writeFileSync(changelogPath, updatedContent);
  console.log(`\nChangelog entry added for version ${version}`);
}

// Main function
async function main() {
  const version = getCurrentVersion();
  const date = getCurrentDate();
  console.log(`Generating changelog for version ${version} on ${date}`);
  
  const { notes, bullets } = await promptForChangelog();
  updateChangelogFile(version, date, notes, bullets);
}

main().catch(err => {
  console.error('Error generating changelog:', err);
  process.exit(1);
}); 