# Worker-tfstate

This project is a CloudFlare Worker that stores the state of a Terraform workspace in a KV namespace.

## Usage
```terraform
terraform {
  backend "http" {
    address = "https://worker.example.com"
  }
}
```

## Configuration
The following environment variables are required:
- USERNAME: The username to authenticate with
- PASSWORD: The password to authenticate with (`wrangler secret put PASSWORD`)
- NAMESPACE_ID: The ID of the KV namespace to use (needs to be bound to the worker) [wrangler.toml](wrangler.toml)

## Development
### Prerequisites
- [Node.js](https://nodejs.org/en/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler) 

### Setup
```bash
npm install
```

## Deployment
```bash
wrangler publish
```

## API Reference

All endpoints require basic authentication with the configured username and password.

### GET /api/v1/:project
Returns the state of the project as JSON.
```bash
curl -X GET https://worker.example.com/api/v1/example -u username:password
```

#### Example response - state not found
```HTTP
HTTP/1.1 404 Not Found
Content-Type: application/json;charset=UTF-8
Content-Length: 0
Cache-Control: no-store
```

#### Example response - state found
```HTTP
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Content-Length: 123
{"version": 4, "terraform_version": "0.12.24", "serial": 4, "lineage": "e2b0f0e0-7f1a-4c4a-8b1a-2b1a0b1a0b1a", "outputs": {}, "resources": []}
```

### POST /api/v1/:project
Updates the state of the project with the JSON body.
```bash
curl -X POST https://worker.example.com/api/v1/example -u username:password -H "Content-Type: application/json" -d '{"version": 4, "terraform_version": "0.12.24", "serial": 4, "lineage": "e2b0f0e0-7f1a-4c4a-8b1a-2b1a0b1a0b1a", "outputs": {}, "resources": []}'
```

#### Example response - state updated
```HTTP
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Content-Length: 123
{"version": 4, "terraform_version": "0.12.24", "serial": 4, "lineage": "e2b0f0e0-7f1a-4c4a-8b1a-2b1a0b1a0b1a", "outputs": {}, "resources": []}
```

### LOCK /api/v1/:project
Locks the statefile.
```bash
curl -X LOCK https://worker.example.com/api/v1/example -u username:password
```

#### Example response - state locked
```HTTP
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
```

#### Example response - state already locked
```HTTP
HTTP/1.1 423 Locked
Content-Type: application/json
Cache-Control: no-store
{"id": "e2b0f0e0-7f1a-4c4a-8b1a-2b1a0b1a0b1a", "operation": "lock", "who": "username", "created": "2020-05-01T00:00:00Z"}
```

### UNLOCK /api/v1/:project
Unlocks the statefile.

#### Example response - state unlocked
```HTTP
HTTP/1.1 200 OK
Cache-Control: no-store
```

### DELETE /api/v1/:project
Deletes the statefile.

#### Example response - state deleted
```HTTP
HTTP/1.1 200 OK
Cache-Control: no-store
```

## License
This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.