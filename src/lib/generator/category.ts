function generateRegexp(text: string) {
  const escaped = text.replace(/\./g, "\\.").replace(/\*/g, ".*?");
  return new RegExp(`^${escaped}$`, "i");
}

export function defineCategories(categories: Record<string, Array<string>>) {
  const matchers: Array<[RegExp, string]> = [];

  for (const [key, value] of Object.entries(categories)) {
    value.forEach((expression) => {
      matchers.push([generateRegexp(expression), key]);
    });
  }

  return function inferCategory(path: string) {
    return matchers.find(([expression]) => expression.test(path))?.[1];
  };
}
