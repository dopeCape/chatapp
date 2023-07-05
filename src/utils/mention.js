function addUserIdToMentions(users, text, type) {
  console.log(type);
  if (type === 'G') {
    users = users.map(x => {
      return x.user;
    });
  }
  let x;
  const mentionRegex = /@(\w+)/g;
  const result = text.replace(mentionRegex, (match, username) => {
    x = x + 1;
    let matchingUsers = [];
    if (type === 'G') {
      matchingUsers = users.filter(user => user.user.name === username);
      if (username === 'all') {
        matchingUsers.push({ user: { id: '1234565' } });
      }
    } else {
      matchingUsers = users.filter(user => user.user.name === username);
    }
    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map(user => user.user.id);
      return `${match}[${userIds.join(',')}]`;
    } else {
      return match;
    }
  });

  return result;
}
function removeBracketsAndIDs(text) {
  const regex = /\[(.*?)\]/g;
  return text.replace(regex, '');
}
function findMentionedMessages(messages, userId) {
  return messages.filter(message => {
    const mentionRegex = /@(\w+)\[(\w+(?:,\w+)*)\]/g;
    const mentionMatches = message.content.match(mentionRegex);

    if (!mentionMatches) {
      return false;
    }

    const mentionUserIds = mentionMatches
      .map(mentionMatch => {
        const mentionRegex = /@(\w+)\[(\w+(?:,\w+)*)\]/;
        const mentionMatchResult = mentionRegex.exec(mentionMatch);
        return mentionMatchResult ? mentionMatchResult[2].split(',') : [];
      })
      .flat();

    return mentionUserIds.includes(userId) || mentionUserIds.includes('1234565');
  });
}

export { addUserIdToMentions, removeBracketsAndIDs, findMentionedMessages };
