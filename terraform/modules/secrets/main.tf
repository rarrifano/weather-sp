# Secrets module — Secrets Manager resources for app secrets and GHCR auth.
#
# Creates empty secret shells. Actual values must be set manually via
# AWS Console or CLI (never stored in Terraform state):
#
#   aws secretsmanager put-secret-value \
#     --secret-id <secret-name> \
#     --secret-string '<value>'

resource "aws_secretsmanager_secret" "openweather_api_key" {
  name        = "${var.name_prefix}/openweather-api-key"
  description = "OpenWeatherMap API key for ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}/openweather-api-key"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret" "ghcr_credentials" {
  name        = "${var.name_prefix}/ghcr-credentials"
  description = "GitHub Container Registry credentials for ${var.environment}"

  tags = {
    Name        = "${var.name_prefix}/ghcr-credentials"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
