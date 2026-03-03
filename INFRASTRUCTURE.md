# Infrastructure Documentation

## Overview

SP Vibes runs on **AWS ECS Fargate** — serverless containers with no EC2 instances to manage.
Infrastructure is defined in **Terraform** and can be validated locally with **LocalStack**
before deploying to real AWS.

### Architecture

```
                 Internet
                    │
                    ▼
              ┌───────────┐
              │    ALB     │  (port 80, public subnets)
              │  HTTP :80  │
              └─────┬──────┘
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
   ┌─────────────┐     ┌─────────────┐
   │  Fargate    │     │  Fargate    │  (public subnets, assign_public_ip)
   │  Task :3000 │     │  Task :3000 │
   └─────────────┘     └─────────────┘
          │                    │
          ▼                    ▼
   Secrets Manager        CloudWatch Logs
   (API key, GHCR)       (/ecs/{env}-sp-vibes)
```

- **Image source:** `ghcr.io/rarrifano/weather-sp` (pulled via GHCR credentials in Secrets Manager)
- **Secrets:** `OPENWEATHER_API_KEY` injected from Secrets Manager as environment variable
- **Networking:** Public subnets only (no NAT Gateway) to minimize cost
- **Auto-scaling:** Production only — target tracking on CPU utilization (70%)

### AWS Account Strategy

| Account     | Profile    | Purpose                   |
|-------------|------------|---------------------------|
| Staging     | `aws-stg`  | Pre-production testing    |
| Production  | `aws-prd`  | Live application          |

Each account has its own:
- S3 bucket for Terraform state
- DynamoDB table for state locking
- Complete set of infrastructure resources (VPC, ECS, ALB, etc.)

## Prerequisites

All tools are installed automatically via [mise](https://mise.jdx.dev/):

```bash
mise install        # Installs: Node 22, Terraform 1.12, Python 3.13, LocalStack CLI, awscli-local, gh
```

You also need:
- **Docker** — for LocalStack and building the app image
- **AWS CLI profiles** configured (for real AWS deployments):
  ```bash
  aws configure --profile aws-stg
  aws configure --profile aws-prd
  ```

## Directory Structure

```
terraform/
├── bootstrap/                      # One-time: S3 + DynamoDB for state (per account)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── modules/                        # Reusable infrastructure modules
│   ├── networking/                 # VPC, public subnets, IGW, security groups
│   ├── ecs-cluster/                # ECS cluster + CloudWatch log group
│   ├── ecs-service/                # Task def + service + ALB + IAM + auto-scaling
│   └── secrets/                    # Secrets Manager (API key + GHCR creds)
│
├── environments/
│   ├── staging/                    # Staging root config (aws-stg account)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── backend.local.tfbackend # LocalStack backend override
│   └── production/                 # Production root config (aws-prd account)
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars
│       └── backend.local.tfbackend
│
└── localstack.tfvars               # LocalStack provider overrides
```

## Quick Start with LocalStack

LocalStack lets you validate all Terraform code locally without AWS credentials or costs.

```bash
# 1. Start LocalStack
mise run localstack:up

# 2. Wait for it to be healthy
mise run localstack:status

# 3. Bootstrap state backend (creates S3 bucket + DynamoDB table)
mise run localstack:bootstrap

# 4. Initialize Terraform with local backend
mise run infra:init:local staging

# 5. Plan and apply
mise run infra:plan:local staging
mise run infra:apply:local staging

# 6. Verify (should show no changes)
mise run infra:plan:local staging

# 7. Clean up
mise run infra:destroy:local staging
mise run localstack:down
```

### LocalStack Limitations (Community Edition)

| AWS Service         | LocalStack Support | Notes                                          |
|---------------------|--------------------|-------------------------------------------------|
| S3                  | ✅ Full            | State backend works perfectly                   |
| DynamoDB            | ✅ Full            | State locking works                             |
| ECS (API)           | ✅ Stubbed         | Resources created, containers don't run         |
| ALB                 | ⚠️ Basic           | Resources created, no real traffic routing      |
| Secrets Manager     | ✅ Full            | Secrets can be created and read                 |
| IAM                 | ✅ Stubbed         | Roles/policies created, not enforced            |
| CloudWatch Logs     | ✅ Basic           | Log groups created                              |
| VPC / Subnets       | ✅ Stubbed         | Resources created, no real networking           |
| Auto-scaling        | ⚠️ Basic           | Policies created, no actual scaling             |

**What LocalStack validates:** Terraform syntax, resource dependencies, variable wiring,
module composition, and the full plan/apply lifecycle. What it doesn't validate: actual
container execution, network connectivity, and IAM enforcement.

## Deploying to Real AWS

### One-time bootstrap (per account)

```bash
# Staging account
cd terraform/bootstrap
terraform init
terraform apply -var="environment=staging" -var="aws_profile=aws-stg"

# Production account
terraform apply -var="environment=production" -var="aws_profile=aws-prd"
```

### Deploy infrastructure

```bash
# Initialize with S3 backend
mise run infra:init staging

# Review changes
mise run infra:plan staging

# Apply
mise run infra:apply staging
```

### Set secrets (after first deploy)

Secrets are created as empty shells by Terraform. Set actual values via AWS CLI:

```bash
# Staging
aws secretsmanager put-secret-value \
  --profile aws-stg \
  --secret-id staging-sp-vibes/openweather-api-key \
  --secret-string 'your-api-key-here'

aws secretsmanager put-secret-value \
  --profile aws-stg \
  --secret-id staging-sp-vibes/ghcr-credentials \
  --secret-string '{"username":"rarrifano","password":"ghp_your_pat_here"}'

# Force ECS to pick up the new secrets
aws ecs update-service \
  --profile aws-stg \
  --cluster staging-sp-vibes-cluster \
  --service staging-sp-vibes-service \
  --force-new-deployment
```

## Environment Differences

| Parameter              | Staging              | Production            |
|------------------------|----------------------|-----------------------|
| AWS profile            | `aws-stg`            | `aws-prd`             |
| VPC CIDR               | `10.0.0.0/16`        | `10.1.0.0/16`         |
| Task CPU / Memory      | 256 / 512 MiB        | 512 / 1024 MiB        |
| Desired task count     | 1                    | 2                     |
| Auto-scaling           | Disabled             | Min 2, Max 4 (CPU 70%)|
| Log retention          | 14 days              | 90 days               |
| State bucket           | `sp-vibes-terraform-state-staging`    | `sp-vibes-terraform-state-production` |

## Cost Estimate (Real AWS)

> **LocalStack is free.** These costs only apply when deploying to real AWS.

### Monthly cost breakdown

| Resource                                      | Staging      | Production   |
|-----------------------------------------------|--------------|--------------|
| **ECS Fargate**                               |              |              |
| └ vCPU ($0.04048/hr × 730hr)                  | 0.25 × $29   | 0.5 × $29 × 2 tasks |
| └ Memory ($0.004445/GB/hr × 730hr)            | 0.5GB × $3   | 1GB × $3 × 2 tasks  |
| Subtotal                                      | **~$9**      | **~$36**     |
| **ALB**                                       |              |              |
| └ Fixed hourly ($0.0225/hr × 730hr)           | $16          | $16          |
| └ LCU (minimal traffic)                       | ~$0          | ~$1          |
| Subtotal                                      | **~$16**     | **~$17**     |
| **Secrets Manager** (2 secrets × $0.40)       | **~$1**      | **~$1**      |
| **CloudWatch Logs** (minimal volume)          | **~$1**      | **~$1**      |
| **S3 + DynamoDB** (state storage)             | **~$1**      | **~$1**      |
| **Total**                                     | **~$28/mo**  | **~$56/mo**  |

### Combined total: **~$84/month** for both environments

### Cost optimization tips

| Tip                                           | Savings       |
|-----------------------------------------------|---------------|
| Tear down staging when not in use             | ~$28/mo       |
| Use Fargate Spot for staging tasks            | ~40% on Fargate |
| Remove ALB, use direct Fargate IP (dev only)  | ~$16/mo per env |
| Reduce production to 1 task (non-HA)          | ~$18/mo       |

### What we deliberately avoided

| Resource          | Monthly cost | Why we skipped it                              |
|-------------------|-------------|------------------------------------------------|
| NAT Gateway (×2)  | ~$130       | Fargate in public subnets with `assign_public_ip` instead |
| HTTPS/ACM/Route53 | ~$1-13      | Not needed yet — ALB serves HTTP on default DNS |
| ECR               | ~$1-5       | Keeping GHCR as image source for now           |
| CloudWatch Alarms | ~$1-5       | Will add with monitoring/alerting later        |

## mise Tasks Reference

### Application

| Task              | Description                     |
|-------------------|---------------------------------|
| `mise run dev`    | Start development server        |
| `mise run build`  | Production build                |
| `mise run test`   | Run tests                       |
| `mise run ci`     | Full CI pipeline                |

### LocalStack

| Task                          | Description                          |
|-------------------------------|--------------------------------------|
| `mise run localstack:up`      | Start LocalStack container           |
| `mise run localstack:down`    | Stop LocalStack container            |
| `mise run localstack:status`  | Check LocalStack health              |
| `mise run localstack:bootstrap` | Create state backend on LocalStack |

### Infrastructure

| Task                                    | Description                              |
|-----------------------------------------|------------------------------------------|
| `mise run infra:init <env>`             | Initialize Terraform (real AWS)          |
| `mise run infra:init:local <env>`       | Initialize Terraform (LocalStack)        |
| `mise run infra:plan <env>`             | Plan changes (real AWS)                  |
| `mise run infra:plan:local <env>`       | Plan changes (LocalStack)                |
| `mise run infra:apply <env>`            | Apply changes (real AWS)                 |
| `mise run infra:apply:local <env>`      | Apply changes (LocalStack)               |
| `mise run infra:destroy <env>`          | Destroy resources (real AWS)             |
| `mise run infra:destroy:local <env>`    | Destroy resources (LocalStack)           |
| `mise run infra:fmt`                    | Format all Terraform files               |
| `mise run infra:validate <env>`         | Validate Terraform configuration         |

Where `<env>` is `staging` or `production`.
