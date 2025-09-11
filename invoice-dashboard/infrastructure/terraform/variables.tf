# Variables for Invoice Dashboard Infrastructure

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "invoice-dashboard"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "owner" {
  description = "Owner of the infrastructure"
  type        = string
  default     = "DevOps Team"
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ssh_cidr" {
  description = "CIDR block that can access SSH"
  type        = string
  default     = "0.0.0.0/0"  # Restrict this in production
}

# Database Configuration
variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "invoice_db"
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  default     = "dbadmin"
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "14.7"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS instance (GB)"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 1000
}

variable "db_backup_retention" {
  description = "Database backup retention period (days)"
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = true
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# Lightsail Configuration
variable "lightsail_bundle_id" {
  description = "Lightsail bundle ID"
  type        = string
  default     = "medium_2_0"  # 4GB RAM, 2 vCPUs, 60GB SSD
}

variable "lightsail_blueprint_id" {
  description = "Lightsail blueprint ID"
  type        = string
  default     = "ubuntu_22_04"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "create_route53_zone" {
  description = "Whether to create a Route53 hosted zone"
  type        = bool
  default     = false
}

# Monitoring
variable "log_retention_days" {
  description = "CloudWatch log retention period (days)"
  type        = number
  default     = 30
}

variable "alert_emails" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = []
}

# Application Configuration
variable "app_port" {
  description = "Port the application runs on"
  type        = number
  default     = 3000
}

variable "n8n_port" {
  description = "Port n8n runs on"
  type        = number
  default     = 5678
}

# Security
variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = true
}

variable "enable_shield" {
  description = "Enable AWS Shield Advanced"
  type        = bool
  default     = false
}

# Backup Configuration
variable "backup_schedule" {
  description = "Backup schedule expression (cron)"
  type        = string
  default     = "cron(0 2 * * ? *)"  # Daily at 2 AM UTC
}

variable "backup_retention" {
  description = "Backup retention period (days)"
  type        = number
  default     = 30
}

# Auto Scaling
variable "min_capacity" {
  description = "Minimum number of Lightsail instances"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of Lightsail instances"
  type        = number
  default     = 3
}

variable "desired_capacity" {
  description = "Desired number of Lightsail instances"
  type        = number
  default     = 2
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Use spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "schedule_shutdown" {
  description = "Schedule to shutdown non-prod instances"
  type        = string
  default     = ""  # e.g., "cron(0 18 * * MON-FRI)"
}

# Feature Flags
variable "enable_cdn" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "enable_elasticsearch" {
  description = "Enable Elasticsearch for logging"
  type        = bool
  default     = false
}

variable "enable_lambda_processing" {
  description = "Enable Lambda for Excel processing"
  type        = bool
  default     = true
}

# Environment-specific configurations
variable "instance_configurations" {
  description = "Environment-specific instance configurations"
  type = map(object({
    lightsail_bundle_id = string
    db_instance_class   = string
    redis_node_type     = string
    multi_az           = bool
    backup_retention   = number
  }))
  
  default = {
    dev = {
      lightsail_bundle_id = "small_2_0"
      db_instance_class   = "db.t3.micro"
      redis_node_type     = "cache.t3.micro"
      multi_az           = false
      backup_retention   = 1
    }
    staging = {
      lightsail_bundle_id = "medium_2_0"
      db_instance_class   = "db.t3.small"
      redis_node_type     = "cache.t3.small"
      multi_az           = false
      backup_retention   = 7
    }
    prod = {
      lightsail_bundle_id = "large_2_0"
      db_instance_class   = "db.t3.medium"
      redis_node_type     = "cache.t3.medium"
      multi_az           = true
      backup_retention   = 30
    }
  }
}