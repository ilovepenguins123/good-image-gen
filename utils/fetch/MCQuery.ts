async function MCQuery(username: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`https://mowojang.matdoes.dev/users/profiles/minecraft/${username}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return "Invalid Username";
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('MCQuery timeout for username:', username);
      return "Invalid Username";
    }
    throw error;
  }
}

export default MCQuery;