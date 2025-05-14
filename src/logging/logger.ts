// deno-lint-ignore no-explicit-any
type Loggable = any;

function prefix(): string {
  const date = new Date();
  return `[${date.toISOString()}]`;
}

function stringify(obj: Loggable): string {
  if (typeof obj === "string") {
    return obj.replaceAll("\n", "\\n");
  } else {
    return JSON.stringify(obj);
  }
}

function generateLogLine(
  prefix: string,
  css: string,
  messages: Loggable[],
) {
  const joined = messages.map(stringify).join(" ");
  return [prefix + " %c" + joined, css];
}

export const logger = {
  debug: function debug(...msg: Loggable[]) {
    console.debug(...generateLogLine(prefix(), "color: grey", msg));
  },

  info: function info(...msg: Loggable[]) {
    console.log(...generateLogLine(prefix(), "color: rgb(255, 255, 255)", msg));
  },

  warn: function warn(...msg: Loggable[]) {
    console.warn(...generateLogLine(prefix(), "color: red", msg));
  },
};
