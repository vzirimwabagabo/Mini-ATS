interface FunctionErrorLike {
  message?: string;
  context?: unknown;
}

export async function getFunctionErrorMessage(error: FunctionErrorLike): Promise<string> {
  if (error.context instanceof Response) {
    try {
      const body: unknown = await error.context.clone().json();
      if (
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof body.error === 'string'
      ) {
        return body.error;
      }
    } catch {
      return `Account request failed with HTTP ${error.context.status}.`;
    }

    return `Account request failed with HTTP ${error.context.status}.`;
  }

  return error.message || 'Account request failed. Check the Supabase Edge Function logs.';
}