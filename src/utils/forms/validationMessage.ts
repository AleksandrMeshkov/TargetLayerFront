function extractMessages(value: unknown, seen = new Set<object>()): string[] {
  if (typeof value === 'string') {
    return value.trim() ? [value] : [];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  if (seen.has(value)) {
    return [];
  }

  seen.add(value);

  const messages: string[] = [];

  const record = value as Record<string, unknown>;

  if ('message' in record) {
    messages.push(...extractMessages(record.message, seen));
  }

  if (messages.length === 0 && 'root' in record) {
    messages.push(...extractMessages(record.root, seen));
  }

  if (messages.length === 0 && 'types' in record) {
    messages.push(...extractMessages(record.types, seen));
  }

  if (messages.length === 0) {
    const entries = Array.isArray(value)
      ? value.entries()
      : Object.entries(record);

    for (const entry of entries) {
      const nestedValue = Array.isArray(value) ? entry[1] : entry[1];
      messages.push(...extractMessages(nestedValue, seen));

      if (messages.length > 0) {
        break;
      }
    }
  }

  return messages;
}

export function getValidationToastMessage(errors: Record<string, unknown>, fallbackMessage: string): string {
  for (const error of Object.values(errors)) {
    const messages = extractMessages(error);
    if (messages.length > 0) {
      return messages[0];
    }
  }

  return fallbackMessage;
}