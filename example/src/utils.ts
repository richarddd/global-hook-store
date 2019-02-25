import { Repo } from "./stores";

const genericFetch: <T>(url: string) => Promise<T> = url =>
  fetch(url).then(response => {
    if (response.status >= 400 && response.status < 600) {
      throw new Error(`Error ${response.status} from server`);
    }
    return response.json();
  });

const githubApi = {
  getRepo: (user: string) =>
    genericFetch<Repo[]>(`https://api.github.com/users/${user}/repos`)
};

export default githubApi;
