# Production environment values.

environment     = "production"
name_prefix     = "prod-sp-vibes"
aws_profile     = "aws-prd"
vpc_cidr        = "10.1.0.0/16"
container_image = "ghcr.io/rarrifano/weather-sp:latest"
task_cpu        = 512
task_memory     = 1024
desired_count   = 2

# Auto-scaling enabled in production
enable_autoscaling       = true
autoscaling_min_capacity = 2
autoscaling_max_capacity = 4
autoscaling_cpu_target   = 70

# Longer log retention for production
log_retention_days = 90
