# Staging environment values.
# These are the defaults — override at plan/apply time with -var if needed.

environment     = "staging"
name_prefix     = "staging-sp-vibes"
aws_profile     = "aws-stg"
vpc_cidr        = "10.0.0.0/16"
container_image = "ghcr.io/rarrifano/weather-sp:latest"
task_cpu        = 256
task_memory     = 512
desired_count   = 1

# No auto-scaling in staging
enable_autoscaling = false
