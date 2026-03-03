# ECS Cluster module — shared Fargate cluster with Container Insights.

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = {
    Name        = "${var.name_prefix}-cluster"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "/ecs/${var.name_prefix}"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
