async function MCQuery(username: string): Promise<any> {
  let response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
  if (!response.ok) {
    response = await fetch(`https://api.mojang.com/users/profiles/minecraft/steve`);
  }
  return response.json();
}

export default MCQuery;