# --- Provider ---

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile name for this environment"
  type        = string
  default     = "aws-stg"
}

variable "use_localstack" {
  description = "Target LocalStack instead of real AWS"
  type        = bool
  default     = false
}

variable "localstack_endpoint" {
  description = "LocalStack gateway endpoint URL"
  type        = string
  default     = "http://localhost:4566"
}

# --- Naming ---

variable "project" {
  description = "Project name"
  type        = string
  default     = "sp-vibes"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "staging-sp-vibes"
}

# --- Networking ---

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

# --- ECS ---

variable "container_image" {
  description = "Docker image URI"
  type        = string
  default     = "ghcr.io/rarrifano/weather-sp:latest"
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 3000
}

variable "task_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory (MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of ECS tasks"
  type        = number
  default     = 1
}

# --- Observability ---

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

# --- Auto-scaling ---

variable "enable_autoscaling" {
  description = "Enable ECS service auto-scaling"
  type        = bool
  default     = false
}

variable "autoscaling_min_capacity" {
  description = "Minimum tasks"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum tasks"
  type        = number
  default     = 2
}

variable "autoscaling_cpu_target" {
  description = "Target CPU utilization percentage"
  type        = number
  default     = 70
}
