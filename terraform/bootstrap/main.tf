# Bootstrap — creates the S3 bucket and DynamoDB table for Terraform state.
#
# This is a chicken-and-egg problem: the state backend must exist before
# Terraform can use it. Run this once per AWS account with local state:
#
#   terraform init
#   terraform apply -var="environment=staging"
#
# After this, the environment root configs can use the S3 backend.

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
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
      s3       = var.localstack_endpoint
      dynamodb = var.localstack_endpoint
      sts      = var.localstack_endpoint
    }
  }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "sp-vibes-terraform-state-${var.environment}"

  # Prevent accidental deletion of state bucket
  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name        = "sp-vibes-terraform-state-${var.environment}"
    Project     = "sp-vibes"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "sp-vibes-terraform-locks-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "sp-vibes-terraform-locks-${var.environment}"
    Project     = "sp-vibes"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
