interface Env {
	// TFState KV Namespace
	tfstate: KVNamespace;

	// Username and password for basic auth
	USERNAME: string;

	// Password for basic auth (should be stored in a secret)
	PASSWORD: string;
}
