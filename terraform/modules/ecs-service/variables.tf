variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "project" {
  description = "Project name for tagging"
  type        = string
}

variable "environment" {
  description = "Environment name for tagging"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the target group"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ALB and ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name (used for auto-scaling resource_id)"
  type        = string
}

variable "log_group_name" {
  description = "CloudWatch log group name for container logs"
  type        = string
}

variable "container_image" {
  description = "Docker image URI (e.g., ghcr.io/rarrifano/weather-sp:latest)"
  type        = string
}

variable "container_port" {
  description = "Container port the app listens on"
  type        = number
  default     = 3000
}

variable "task_cpu" {
  description = "Fargate task CPU units (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB (512, 1024, 2048, ...)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "secret_arns" {
  description = "List of Secrets Manager ARNs the task execution role can read"
  type        = list(string)
}

variable "openweather_api_key_secret_arn" {
  description = "ARN of the Secrets Manager secret for OPENWEATHER_API_KEY"
  type        = string
}

variable "ghcr_credentials_secret_arn" {
  description = "ARN of the Secrets Manager secret for GHCR pull credentials (null to skip)"
  type        = string
  default     = null
}

variable "enable_autoscaling" {
  description = "Enable auto-scaling for the ECS service"
  type        = bool
  default     = false
}

variable "autoscaling_min_capacity" {
  description = "Minimum number of tasks when auto-scaling"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of tasks when auto-scaling"
  type        = number
  default     = 4
}

variable "autoscaling_cpu_target" {
  description = "Target CPU utilization percentage for auto-scaling"
  type        = number
  default     = 70
}
