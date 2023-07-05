import { Fzf } from 'fzf';

//Dear maintainer:
//once you are done trying to "optimize" this func,
//and have realized what a terrble mistake is was,
//please increment the following counter as a warning
//to next guy
//total_hours_wasted_here = 1.5
function calculateLevenshteinDistance(a, b) {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1,
        distanceMatrix[j - 1][i] + 1,
        distanceMatrix[j - 1][i - 1] + indicator
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}
function search(users, query, user) {
  users = users.filter(x => {
    return x.user.id !== user.id;
  });
  let results = users.map(object => {
    const similarity = calculateLevenshteinDistance(query, object.user.name.toLowerCase());

    return { object, similarity };
  });

  // Sort the results based on similarity
  results.sort((a, b) => a.similarity - b.similarity);
  results = results.map(x => x.object);

  return results;
}

function simpleSearch(users, query) {
  try {
    let results = users.map(object => {
      const similarity = calculateLevenshteinDistance(query, object.user.name.toLowerCase());
      return { object, similarity };
    });
    // Sort the results based on similarity
    results.sort((a, b) => a.similarity - b.similarity);
    results = results.map(x => x.object);

    return results;
  } catch (error) {
    console.log(error);
  }
}
function userSeach(users, query) {
  try {
    const fzf = new Fzf(users, { selector: x => x.name });
    let res = fzf.find(query);

    return res;
  } catch (error) {
    console.log(error);
  }
}
function fileSeacrh(list, query) {
  try {
    const fzf = new Fzf(list, { selector: x => x.content });
    let res = fzf.find(query);
    return res;
  } catch (error) {
    console.log(error);
  }
}

function isValidEmail(email) {
  // Regular expression for validating email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if the email matches the regular expression
  return emailRegex.test(email);
}
export { search, simpleSearch, isValidEmail, fileSeacrh, userSeach };
