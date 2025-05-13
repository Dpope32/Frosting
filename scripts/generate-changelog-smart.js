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
    console.warn('Error getting git commits:', error.message);
    return [];
  }
}

// Function to get changed files since last version
function getChangedFiles() {
  try {
    // Find the last version tag or commit
    let lastTag;
    try {
      lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
      // If no tags exist, use the last 20 commits
      return execSync('git diff --name-only HEAD~20').toString().split('\n').filter(file => file.trim() !== '');
    }
    
    // Get files changed since last tag
    return execSync(`git diff --name-only ${lastTag}..HEAD`).toString()
      .split('\n')
      .filter(file => file.trim() !== '');
  } catch (error) {
    console.warn('Error getting changed files:', error.message);
    return [];
  }
}

// Generate catchier titles based on changed areas
function getCatchyTitle(changedAreas) {
  const areaNames = Object.keys(changedAreas);
  
  // Special case titles based on what changed
  if (changedAreas['components'] && changedAreas['styles']) {
    return 'UI Refresh & Design Updates';
  }
  
  if (changedAreas['components'] && changedAreas['services']) {
    return 'Enhanced Features & Services';
  }
  
  if (changedAreas['utils'] && changedAreas['services']) {
    return 'Performance & Core Improvements';
  }
  
  if (changedAreas['assets']) {
    return 'Visual Refinements & Assets Update';
  }
  
  if (changedAreas['api'] || changedAreas['services']) {
    return 'Backend Improvements & API Updates';
  }
  
  if (changedAreas['components'] && changedAreas['hooks']) {
    return 'UI Enhancements & Code Refinements';
  }
  
  if (changedAreas['hooks'] || changedAreas['utils']) {
    return 'Under the Hood: Performance & Stability';
  }
  
  if (changedAreas['tests']) {
    return 'Reliability & Testing Improvements';
  }
  
  // Generic titles based on number of changed areas
  if (areaNames.length === 1) {
    const area = areaNames[0];
    const titles = {
      'components': 'UI Components Upgrade',
      'services': 'Service Layer Improvements',
      'utils': 'Core Utilities Enhancement',
      'screens': 'Screen Layouts Refresh',
      'constants': 'Configuration Updates',
      'hooks': 'React Hooks Optimization',
      'store': 'State Management Updates',
      'assets': 'Visual Assets Refresh',
      'api': 'API Integration Updates',
      'scripts': 'Developer Workflow Improvements'
    };
    
    return titles[area] || `${area.charAt(0).toUpperCase() + area.slice(1)} Improvements`;
  } 
  
  if (areaNames.length === 2) {
    return `${areaNames[0].charAt(0).toUpperCase() + areaNames[0].slice(1)} & ${areaNames[1].charAt(0).toUpperCase() + areaNames[1].slice(1)} Updates`;
  }
  
  // More than 2 areas changed
  return 'Cross-Platform Improvements';
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
  
  // Generate catchier summary note
  const suggestedNote = getCatchyTitle(changedAreas);
  
  // Generate shorter bullet points from commit messages
  const bulletPoints = [];
  
  // Look for bug fixes
  const bugfixes = commits.filter(c => 
    c.toLowerCase().includes('fix') || 
    c.toLowerCase().includes('bug') || 
    c.toLowerCase().includes('patch')
  );
  
  if (bugfixes.length > 0) {
    const sample = bugfixes[0].replace(/^fix(ed)?:?\s*/i, '');
    // Shorten the bullet point
    let fixBullet = sample.split(' ').slice(0, 4).join(' ');
    fixBullet = `Fixed ${fixBullet}`;
    bulletPoints.push(fixBullet);
  }
  
  // Look for new features
  const features = commits.filter(c => 
    c.toLowerCase().includes('add') || 
    c.toLowerCase().includes('new') || 
    c.toLowerCase().includes('feat')
  );
  
  if (features.length > 0) {
    const sample = features[0].replace(/^(add(ed)?|feat(ure)?):?\s*/i, '');
    // Keep it short and sweet
    let addBullet = sample.split(' ').slice(0, 4).join(' ');
    addBullet = `Added ${addBullet}`;
    bulletPoints.push(addBullet);
  }
  
  // Look for improvements
  const improvements = commits.filter(c => 
    c.toLowerCase().includes('improv') || 
    c.toLowerCase().includes('enhanc') || 
    c.toLowerCase().includes('updat') ||
    c.toLowerCase().includes('optim')
  );
  
  if (improvements.length > 0) {
    const sample = improvements[0].replace(/^(improv(ed|ement)?|enhanc(ed|ement)?|updat(ed|e)?):?\s*/i, '');
    // Keep it concise
    let improveBullet = sample.split(' ').slice(0, 4).join(' ');
    improveBullet = `Improved ${improveBullet}`;
    bulletPoints.push(improveBullet);
  }
  
  // Add a UI/UX bullet if relevant files changed
  if (changedAreas['components'] || changedAreas['styles'] || changedAreas['assets']) {
    bulletPoints.push('UI/UX refinements');
  }
  
  // Add a performance bullet if performance-related terms are in commits
  if (commits.some(c => 
    c.toLowerCase().includes('performance') || 
    c.toLowerCase().includes('speed') || 
    c.toLowerCase().includes('optim')
  )) {
    bulletPoints.push('Better app performance');
  }
  
  // Ensure we have 3-5 bullets
  while (bulletPoints.length < 3) {
    const otherCommits = commits.filter(c => 
      !bugfixes.includes(c) && 
      !features.includes(c) && 
      !improvements.includes(c)
    );
    
    if (otherCommits.length > 0) {
      // Keep it short
      const sample = otherCommits[0];
      const shortBullet = sample.split(' ').slice(0, 5).join(' ');
      bulletPoints.push(`${shortBullet}`);
      commits.splice(commits.indexOf(otherCommits[0]), 1);
    } else {
      break;
    }
  }
  
  // Add some general statements if we're still short on bullets
  if (bulletPoints.length < 3) {
    const generalBullets = [
      'Bug fixes and tweaks',
      'Minor UI adjustments',
      'Performance optimizations',
      'Code quality improvements',
      'Documentation updates'
    ];
    
    for (const bullet of generalBullets) {
      if (bulletPoints.length < 3) {
        bulletPoints.push(bullet);
      } else {
        break;
      }
    }
  }
  
  // Limit to 5 bullets
  return {
    suggestedNote,
    suggestedBullets: [...new Set(bulletPoints)].slice(0, 5) // Remove duplicates
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