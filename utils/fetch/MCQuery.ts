async function MCQuery(username: string): Promise<any> {
  let response = await fetch(`https://mowojang.matdoes.dev/users/profiles/minecraft/${username}`);
  if (!response.ok) {
    return "Invalid Username";
  }
  return response.json();
}

export default MCQuery;