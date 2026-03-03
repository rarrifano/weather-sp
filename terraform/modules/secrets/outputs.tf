output "openweather_api_key_secret_arn" {
  description = "ARN of the OpenWeatherMap API key secret"
  value       = aws_secretsmanager_secret.openweather_api_key.arn
}

output "ghcr_credentials_secret_arn" {
  description = "ARN of the GHCR credentials secret"
  value       = aws_secretsmanager_secret.ghcr_credentials.arn
}

output "all_secret_arns" {
  description = "List of all secret ARNs (for IAM policy)"
  value = [
    aws_secretsmanager_secret.openweather_api_key.arn,
    aws_secretsmanager_secret.ghcr_credentials.arn,
  ]
}
