export type Dictionary = Record<string, any>;

function getByPath(obj: Dictionary, path: string) {
  return path.split(".").reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
}

export function createTranslator(dict: Dictionary) {
  return (key: string, fallback?: string) => {
    const value = getByPath(dict, key);
    if (typeof value === "string") return value;
    return fallback ?? key;
  };
}
