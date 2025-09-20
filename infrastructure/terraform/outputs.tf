# Outputs for Invoice Dashboard Infrastructure

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs of the database subnets"
  value       = aws_subnet.database[*].id
}

# Database Outputs
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "database_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

# Redis Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "redis_secret_arn" {
  description = "ARN of the Redis credentials secret"
  value       = aws_secretsmanager_secret.redis_credentials.arn
}

# S3 Outputs
output "excel_files_bucket_name" {
  description = "Name of the S3 bucket for Excel files"
  value       = aws_s3_bucket.excel_files.bucket
}

output "excel_files_bucket_arn" {
  description = "ARN of the S3 bucket for Excel files"
  value       = aws_s3_bucket.excel_files.arn
}

output "excel_files_bucket_domain_name" {
  description = "Domain name of the S3 bucket for Excel files"
  value       = aws_s3_bucket.excel_files.bucket_domain_name
}

# Security Groups
output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.database.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

# KMS
output "kms_key_id" {
  description = "ID of the KMS key"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "ARN of the KMS key"
  value       = aws_kms_key.main.arn
}

# SNS
output "alerts_topic_arn" {
  description = "ARN of the SNS alerts topic"
  value       = aws_sns_topic.alerts.arn
}

# CloudWatch
output "app_log_group_name" {
  description = "Name of the application CloudWatch log group"
  value       = aws_cloudwatch_log_group.app.name
}

output "n8n_log_group_name" {
  description = "Name of the n8n CloudWatch log group"
  value       = aws_cloudwatch_log_group.n8n.name
}

# Environment Variables for Application
output "environment_variables" {
  description = "Environment variables for the application"
  value = {
    AWS_REGION = var.aws_region
    PROJECT_NAME = var.project_name
    ENVIRONMENT = var.environment
    
    # Database
    DB_SECRET_ARN = aws_secretsmanager_secret.db_credentials.arn
    
    # Redis
    REDIS_SECRET_ARN = aws_secretsmanager_secret.redis_credentials.arn
    
    # S3
    EXCEL_BUCKET_NAME = aws_s3_bucket.excel_files.bucket
    
    # KMS
    KMS_KEY_ID = aws_kms_key.main.key_id
    
    # Monitoring
    ALERTS_TOPIC_ARN = aws_sns_topic.alerts.arn
    APP_LOG_GROUP = aws_cloudwatch_log_group.app.name
    N8N_LOG_GROUP = aws_cloudwatch_log_group.n8n.name
  }
  sensitive = true
}

# Database Connection String (for local development)
output "database_url" {
  description = "Database connection URL (for local development only)"
  value       = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

# Redis Connection String (for local development)
output "redis_url" {
  description = "Redis connection URL (for local development only)"
  value       = "redis://:${random_password.redis_auth.result}@${aws_elasticache_replication_group.main.primary_endpoint_address}:${aws_elasticache_replication_group.main.port}"
  sensitive   = true
}

# Lightsail Configuration (for deployment scripts)
output "lightsail_config" {
  description = "Configuration for Lightsail instances"
  value = {
    bundle_id = var.lightsail_bundle_id
    blueprint_id = var.lightsail_blueprint_id
    availability_zone = local.azs[0]
    vpc_id = aws_vpc.main.id
    subnet_id = aws_subnet.public[0].id
    security_group_id = aws_security_group.app.id
    key_pair_name = "${var.project_name}-keypair"
  }
}

# Cost Estimation
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value = {
    lightsail_instances = var.desired_capacity * (
      var.lightsail_bundle_id == "small_2_0" ? 10 :
      var.lightsail_bundle_id == "medium_2_0" ? 20 :
      var.lightsail_bundle_id == "large_2_0" ? 40 : 20
    )
    rds_postgres = (
      var.db_instance_class == "db.t3.micro" ? 13 :
      var.db_instance_class == "db.t3.small" ? 25 :
      var.db_instance_class == "db.t3.medium" ? 50 : 25
    )
    elasticache_redis = (
      var.redis_node_type == "cache.t3.micro" ? 15 :
      var.redis_node_type == "cache.t3.small" ? 30 :
      var.redis_node_type == "cache.t3.medium" ? 60 : 15
    )
    s3_storage = 5
    cloudwatch = 5
    secrets_manager = 2
    kms = 1
    sns = 1
    total_estimated = (
      (var.desired_capacity * (
        var.lightsail_bundle_id == "small_2_0" ? 10 :
        var.lightsail_bundle_id == "medium_2_0" ? 20 :
        var.lightsail_bundle_id == "large_2_0" ? 40 : 20
      )) +
      (var.db_instance_class == "db.t3.micro" ? 13 :
       var.db_instance_class == "db.t3.small" ? 25 :
       var.db_instance_class == "db.t3.medium" ? 50 : 25) +
      (var.redis_node_type == "cache.t3.micro" ? 15 :
       var.redis_node_type == "cache.t3.small" ? 30 :
       var.redis_node_type == "cache.t3.medium" ? 60 : 15) +
      5 + 5 + 2 + 1 + 1
    )
  }
}

# Deployment Information
output "deployment_info" {
  description = "Information needed for deployment"
  value = {
    region = var.aws_region
    project_name = var.project_name
    environment = var.environment
    
    # Application URLs (will be set after domain configuration)
    app_url = var.domain_name != "" ? "https://${var.domain_name}" : "https://${var.project_name}.example.com"
    n8n_url = var.domain_name != "" ? "https://n8n.${var.domain_name}" : "https://n8n.${var.project_name}.example.com"
    
    # Deployment commands
    deployment_commands = [
      "aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.db_credentials.arn} --region ${var.aws_region}",
      "aws s3 sync . s3://${aws_s3_bucket.excel_files.bucket}/ --exclude '*' --include '*.xlsx'",
      "docker build -t ${var.project_name}:latest .",
      "docker tag ${var.project_name}:latest ${local.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project_name}:latest"
    ]
  }
}