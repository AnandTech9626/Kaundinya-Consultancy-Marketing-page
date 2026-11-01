type PasswordCredentialCtor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

export async function savePasswordCredential(
  id: string,
  password: string,
  name?: string,
): Promise<void> {
  try {
    const PasswordCredential = (
      window as unknown as { PasswordCredential?: PasswordCredentialCtor }
    ).PasswordCredential;

    if (!PasswordCredential || !navigator.credentials?.store) return;

    await navigator.credentials.store(
      new PasswordCredential({ id, password, name }),
    );
  } catch {
    // The browser may block credential storage; ignore.
  }
}
