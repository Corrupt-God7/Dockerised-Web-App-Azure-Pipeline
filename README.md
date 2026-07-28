# Dockerised Web App + Azure DevOps CI/CD Pipeline

A small Node.js/Express web application, containerised with Docker and deployed
through an automated Azure DevOps CI/CD pipeline to **Azure Container Registry (ACR)**,
with an optional stage to release it to **Azure App Service for Containers**.

This was my first hands-on cloud deployment project — built to learn the full
loop from source code to a running container image in the cloud, driven entirely
by a pipeline instead of manual steps.

**Stack:** Docker · Azure DevOps · Azure Container Registry (ACR) · CI/CD

---

## What this project demonstrates

- Writing a production-style, **multi-stage Dockerfile** (small image, non-root
  user, health check) instead of a single fat layer.
- Structuring an **Azure Pipelines YAML** file with distinct build/push and
  deploy stages.
- Using a **Docker Registry service connection** in Azure DevOps to
  authenticate securely against ACR (no credentials hardcoded in the pipeline).
- Automatic image tagging by build ID plus a rolling `latest` tag.
- Optional continuous delivery to **Azure Web App for Containers**, so a
  merge to `main` can end with a live, updated container running in Azure.

## Project structure

```
.
├── app/
│   ├── index.js          # Express app (root + /health endpoints)
│   └── package.json
├── Dockerfile             # Multi-stage build → slim runtime image
├── .dockerignore
├── azure-pipelines.yml    # CI/CD pipeline definition
└── README.md
```

## The application

A minimal Express API with two routes:

| Route      | Purpose                                              |
|------------|-------------------------------------------------------|
| `GET /`      | Returns a JSON payload with hostname, timestamp, and app version — useful for confirming which build/container is actually serving traffic |
| `GET /health`| Health check endpoint, used by the Docker `HEALTHCHECK` and can be wired into App Service health probes |

## Running it locally

```bash
# Build the image
docker build -t dockerised-web-app:local .

# Run it
docker run -p 3000:3000 dockerised-web-app:local

# Test it
curl http://localhost:3000
curl http://localhost:3000/health
```

## The pipeline

`azure-pipelines.yml` runs on every push to `main` and has two stages:

1. **BuildAndPush**
   Uses the `Docker@2` task to build the image from the `Dockerfile` and push
   it straight to ACR, tagged with both the Azure DevOps `Build.BuildId` and
   `latest`.

2. **DeployToAzure** *(optional)*
   Takes the image just pushed and deploys it to an Azure Web App for
   Containers using the `AzureWebAppContainer@1` task. This stage only runs
   if the build stage succeeds, and targets an `environment: production`
   so deployments show up in Azure DevOps' Environments view with full
   history/traceability.

### One-time setup required in Azure DevOps

Before the pipeline can run successfully:

1. **Create an ACR instance** (or use an existing one) — e.g.
   `myregistry.azurecr.io`.
2. **Create a Docker Registry service connection**
   *(Project Settings → Service connections → New service connection →
   Docker Registry → Azure Container Registry)* and select your ACR.
   Update `dockerRegistryServiceConnection` in `azure-pipelines.yml` to match
   its name.
3. Update `containerRegistry` and `imageRepository` in the `variables` block
   to match your ACR login server and desired image name.
4. *(Optional, for stage 2 only)* Create an **Azure Resource Manager**
   service connection and an existing **Web App for Containers**, then set
   `azureSubscriptionServiceConnection` and `webAppName` accordingly. If you
   don't need continuous deployment, just delete the `DeployToAzure` stage.

## Design decisions / what I learned

- **Multi-stage Dockerfile**: keeps the final runtime image lean by discarding
  build-only files, and reduces the attack surface.
- **Non-root container user**: the app runs as `appuser`, not root, following
  container security best practice.
- **Service connections over embedded secrets**: authentication to ACR is
  handled entirely by Azure DevOps' service connection, so no registry
  credentials ever appear in the pipeline YAML or logs.
- **Build-ID tagging**: every image pushed to ACR is traceable back to the
  exact Azure DevOps build that produced it, while `latest` stays available
  for convenience.

## Possible next steps

- Add automated tests as a stage before the build/push step.
- Add vulnerability scanning of the image (e.g., Microsoft Defender for
  Containers or `trivy`) before it's allowed to push to ACR.
- Parameterise the pipeline with a variable group / Key Vault-linked
  variables for multiple environments (dev/staging/prod).
- Move from Web App for Containers to Azure Container Apps or AKS for more
  advanced orchestration.
