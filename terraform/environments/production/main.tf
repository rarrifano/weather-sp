# Production environment — wires all modules together.
#
# Usage:
#   LocalStack:  terraform init -backend-config=backend.local.tfbackend
#                terraform plan -var-file=../../localstack.tfvars
#
#   Real AWS:    terraform init
#                terraform plan

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Default backend — S3 in the production AWS account.
  # Override with -backend-config=backend.local.tfbackend for LocalStack.
  backend "s3" {
    bucket         = "sp-vibes-terraform-state-production"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "sp-vibes-terraform-locks-production"
    encrypt        = true
  }
}

provider "aws" {
  region                      = var.aws_region
  profile                     = var.use_localstack ? null : var.aws_profile
  skip_credentials_validation = var.use_localstack
  skip_metadata_api_check     = var.use_localstack
  skip_requesting_account_id  = var.use_localstack
  s3_use_path_style           = var.use_localstack

  dynamic "endpoints" {
    for_each = var.use_localstack ? [1] : []
    content {
      s3                     = var.localstack_endpoint
      dynamodb               = var.localstack_endpoint
      ecs                    = var.localstack_endpoint
      ec2                    = var.localstack_endpoint
      iam                    = var.localstack_endpoint
      sts                    = var.localstack_endpoint
      secretsmanager         = var.localstack_endpoint
      cloudwatchlogs         = var.localstack_endpoint
      elasticloadbalancingv2 = var.localstack_endpoint
      applicationautoscaling = var.localstack_endpoint
    }
  }
}

# --- Modules ---

module "networking" {
  source = "../../modules/networking"

  name_prefix    = var.name_prefix
  project        = var.project
  environment    = var.environment
  vpc_cidr       = var.vpc_cidr
  container_port = var.container_port
}

module "ecs_cluster" {
  source = "../../modules/ecs-cluster"

  name_prefix               = var.name_prefix
  project                   = var.project
  environment               = var.environment
  enable_container_insights = var.enable_container_insights
  log_retention_days        = var.log_retention_days
}

module "secrets" {
  source = "../../modules/secrets"

  name_prefix = var.name_prefix
  project     = var.project
  environment = var.environment
}

module "ecs_service" {
  source = "../../modules/ecs-service"

  name_prefix           = var.name_prefix
  project               = var.project
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  subnet_ids            = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  ecs_security_group_id = module.networking.ecs_security_group_id
  cluster_id            = module.ecs_cluster.cluster_id
  cluster_name          = module.ecs_cluster.cluster_name
  log_group_name        = module.ecs_cluster.log_group_name
  container_image       = var.container_image
  container_port        = var.container_port
  task_cpu              = var.task_cpu
  task_memory           = var.task_memory
  desired_count         = var.desired_count

  secret_arns                    = module.secrets.all_secret_arns
  openweather_api_key_secret_arn = module.secrets.openweather_api_key_secret_arn
  ghcr_credentials_secret_arn    = module.secrets.ghcr_credentials_secret_arn

  enable_autoscaling       = var.enable_autoscaling
  autoscaling_min_capacity = var.autoscaling_min_capacity
  autoscaling_max_capacity = var.autoscaling_max_capacity
  autoscaling_cpu_target   = var.autoscaling_cpu_target
}
