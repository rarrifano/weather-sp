variable "name_prefix" {
  description = "Prefix for resource names (e.g., staging-sp-vibes)"
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

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "container_port" {
  description = "Application container port (used for ECS security group rule)"
  type        = number
  default     = 3000
}
