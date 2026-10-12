export function serializeSettings(settings) {
  return (
    Object.entries(settings)
      .map(([key, value]) => {
        // dotenv preserves backslashes before JSON quotes. These values are
        // already single-line; avoid introducing an extra escape layer.
        if (typeof value !== "string" || /[\r\n]/.test(value)) {
          throw new Error("Expected single-line settings.");
        }
        return key + "=" + value;
      })
      .join("\n") + "\n"
  );
}
