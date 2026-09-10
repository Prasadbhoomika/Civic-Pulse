# CivicPulse DevOps Implementation

This repository turns the original MERN application into a deployable DevOps project.

## Toolchain

- **Git + GitHub** — source control and collaboration
- **Docker** — reproducible frontend/backend images
- **Docker Compose** — local multi-container environment
- **GitHub Actions** — CI pipeline and Docker build/smoke test
- **Jenkins** — alternative CI/CD pipeline for self-hosted environments
- **Nginx** — production static hosting and API reverse proxy
- **Kubernetes** — scalable deployment, probes, rolling updates and HPA
- **MongoDB StatefulSet** — demo/self-managed database for Kubernetes
- **Secrets/ConfigMaps** — environment separation and secret injection

## Local Docker deployment

1. Copy `.env.example` to `.env` if you want custom values.
2. From the repository root run:

```bash
docker compose up --build
```

3. Open `http://localhost:3000`.
4. API health: `http://localhost:3000/api/health`.

Stop:

```bash
docker compose down
```

Persisted MongoDB and uploads are stored in Docker volumes.

## CI/CD flow

```text
Developer
   |
   v
GitHub PR / push
   |
   +--> Backend npm ci + syntax check
   |
   +--> Frontend npm ci + production build
   |
   +--> Docker image builds
   |
   +--> Compose smoke test
   |
   v
Deploy stage (Jenkins/GitHub Actions -> Kubernetes)
   |
   v
Kubernetes rolling update
   |
   +--> readiness probe
   +--> liveness probe
   +--> HPA
   +--> Service
   v
Nginx Ingress -> Frontend -> Backend -> MongoDB
```

## Kubernetes

Build and push images to your registry, then replace `YOUR_GITHUB_USER` in `k8s/backend.yaml` and `k8s/frontend.yaml`.

Create the namespace/config:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/secret.example.yaml
```

For a real environment, create the secret without committing it:

```bash
kubectl -n civicpulse create secret generic civicpulse-secret   --from-literal=JWT_SECRET='use-a-long-random-secret'
```

Then deploy:

```bash
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

Check:

```bash
kubectl -n civicpulse get pods,svc
kubectl -n civicpulse rollout status deployment/backend
kubectl -n civicpulse rollout status deployment/frontend
```

## Jenkins

Create a Jenkins Pipeline job pointing at the repository. The included `Jenkinsfile` performs:

1. Checkout
2. Backend CI
3. Frontend CI
4. Docker image build
5. Docker Compose integration smoke test

For a production pipeline, add registry credentials and a deployment stage that updates the Kubernetes image tag.

## Production hardening

Before public deployment:

- Use MongoDB Atlas or a managed MongoDB service rather than the demo StatefulSet.
- Store `JWT_SECRET` in GitHub/Jenkins/Kubernetes secrets.
- Use TLS at the ingress/load balancer.
- Pin production image versions instead of `latest`.
- Add image scanning (Trivy), dependency scanning and SBOM generation.
- Add centralized logs and metrics (Prometheus/Grafana or a cloud monitoring service).
- Add backups and restore testing for MongoDB.
- Configure resource requests/limits for every workload.
