const prefix = "devguard:";
const memory: Record<string, string> = {}; // use a local object to store the data

function get(key: string, d: string): string;
function get(key: string): string | undefined;
function get(key: string, d?: string): string | undefined {
  if (memory[key]) return memory[key];
  return localStorage.getItem(prefix + key) ?? d;
}

export const localStore = {
  get,
  set: (key: string, value: string) => {
    memory[key] = value;
    localStorage.setItem(prefix + key, value);
  },
};
