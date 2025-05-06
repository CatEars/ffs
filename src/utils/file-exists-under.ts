export function fileExistsUnder(
  filePath: string,
  root: string,
): string | undefined {
  const resolvedPath = Deno.realPathSync(filePath);
  const resolvedRoot = Deno.realPathSync(root);
  if (resolvedPath.startsWith(resolvedRoot)) {
    return resolvedPath;
  }
}
