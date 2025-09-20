# 🚀 AWS Infrastructure Setup Guide - Invoice Management System

## Prerequisites Checklist
- [ ] AWS Account with billing alerts configured
- [ ] AWS CLI installed and configured
- [ ] Terraform v1.5+ installed
- [ ] Docker Desktop installed
- [ ] Node.js 20 LTS installed
- [ ] GitHub account with repository created

## 🔐 Step 1: AWS Account Security Setup

### 1.1 Enable MFA on Root Account
```bash
# Never use root account for daily operations
# Go to AWS Console → Security Credentials → Enable MFA
```

### 1.2 Create IAM Admin User
```bash
aws iam create-user --user-name invoice-admin
aws iam attach-user-policy --user-name invoice-admin --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam create-access-key --user-name invoice-admin > admin-credentials.json
```

### 1.3 Configure AWS CLI
```bash
aws configure --profile invoice-prod
# Enter Access Key ID and Secret from admin-credentials.json
# Region: us-east-1 (or your preferred region)
# Output format: json
```

## 🏗️ Step 2: Infrastructure as Code Setup

### 2.1 Create Terraform Configuration
```bash
mkdir -p infrastructure/terraform
cd infrastructure/terraform
```

### 2.2 Initialize Terraform Backend
Create `backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket         = "invoice-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### 2.3 Create S3 Bucket for Terraform State
```bash
aws s3api create-bucket --bucket invoice-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket invoice-terraform-state --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket invoice-terraform-state \
  --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
```

## 🗄️ Step 3: RDS PostgreSQL Setup

### 3.1 Create RDS Subnet Group
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name invoice-db-subnet \
  --db-subnet-group-description "Subnet group for invoice database" \
  --subnet-ids subnet-xxx subnet-yyy
```

### 3.2 Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier invoice-prod-db \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username dbadmin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 100 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --multi-az \
  --db-subnet-group-name invoice-db-subnet \
  --vpc-security-group-ids sg-xxx
```

### 3.3 Store Database Credentials in Secrets Manager
```bash
aws secretsmanager create-secret \
  --name invoice-db-credentials \
  --description "RDS PostgreSQL credentials for invoice system" \
  --secret-string '{"username":"dbadmin","password":"<generated-password>"}'
```

## 💻 Step 4: Lightsail Instance Setup

### 4.1 Create Lightsail Instance
```bash
aws lightsail create-instances \
  --instance-names invoice-app-prod \
  --availability-zone us-east-1a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id medium_2_0 \
  --user-data file://user-data.sh
```

### 4.2 User Data Script (`user-data.sh`)
```bash
#!/bin/bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Install monitoring agents
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

# Create app directory
mkdir -p /opt/invoice-app
chown ubuntu:ubuntu /opt/invoice-app
```

### 4.3 Attach Static IP
```bash
aws lightsail allocate-static-ip --static-ip-name invoice-app-ip
aws lightsail attach-static-ip --static-ip-name invoice-app-ip --instance-name invoice-app-prod
```

## 🔄 Step 5: Load Balancer Setup

### 5.1 Create Load Balancer
```bash
aws lightsail create-load-balancer \
  --load-balancer-name invoice-lb \
  --instance-port 80
```

### 5.2 Attach Certificate
```bash
aws lightsail create-load-balancer-tls-certificate \
  --load-balancer-name invoice-lb \
  --certificate-name invoice-cert \
  --certificate-domain-names invoice.yourdomain.com
```

## 📦 Step 6: S3 Bucket for Excel Files

### 6.1 Create S3 Bucket
```bash
aws s3api create-bucket \
  --bucket invoice-excel-files \
  --region us-east-1 \
  --acl private

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket invoice-excel-files \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket invoice-excel-files \
  --server-side-encryption-configuration file://encryption.json
```

### 6.2 Configure Lifecycle Policy
```json
{
  "Rules": [{
    "Id": "ArchiveOldFiles",
    "Status": "Enabled",
    "Transitions": [{
      "Days": 30,
      "StorageClass": "STANDARD_IA"
    }, {
      "Days": 90,
      "StorageClass": "GLACIER"
    }]
  }]
}
```

## 🔑 Step 7: AWS Cognito Setup

### 7.1 Create User Pool
```bash
aws cognito-idp create-user-pool \
  --pool-name invoice-users \
  --policies file://password-policy.json \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL \
  --user-pool-add-ons AdvancedSecurityMode=ENFORCED
```

### 7.2 Create App Client
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxx \
  --client-name invoice-web-app \
  --generate-secret \
  --refresh-token-validity 30 \
  --access-token-validity 1 \
  --id-token-validity 1
```

## 🚨 Step 8: Monitoring Setup

### 8.1 Create CloudWatch Dashboard
```bash
aws cloudwatch put-dashboard \
  --dashboard-name InvoiceSystemDashboard \
  --dashboard-body file://dashboard.json
```

### 8.2 Create Alarms
```bash
# CPU Utilization Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name invoice-high-cpu \
  --alarm-description "Alarm when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Database Connection Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name invoice-db-connections \
  --alarm-description "Alarm when DB connections exceed 80" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80
```

## 🔄 Step 9: CI/CD Pipeline Setup

### 9.1 Create CodeBuild Project
```bash
aws codebuild create-project \
  --name invoice-build \
  --source type=GITHUB,location=https://github.com/yourusername/invoice-dashboard \
  --artifacts type=S3,location=invoice-build-artifacts \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:5.0,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::xxx:role/codebuild-role
```

### 9.2 Create CodePipeline
```bash
aws codepipeline create-pipeline --cli-input-json file://pipeline.json
```

## 🎯 Step 10: DNS Configuration

### 10.1 Create Route 53 Hosted Zone
```bash
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)
```

### 10.2 Create A Record
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-records.json
```

## 📊 Step 11: ElastiCache Redis Setup

### 11.1 Create Redis Cluster
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id invoice-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name invoice-cache-subnet
```

## 🔒 Step 12: Security Configuration

### 12.1 Create WAF Rules
```bash
aws wafv2 create-web-acl \
  --name invoice-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### 12.2 Enable GuardDuty
```bash
aws guardduty create-detector --enable
```

## 📝 Environment Variables Configuration

Create `.env.production`:
```env
# Database
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/invoice_db

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=invoice-excel-files

# Redis
REDIS_URL=redis://elasticache-endpoint:6379

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxx
COGNITO_CLIENT_ID=xxx
COGNITO_CLIENT_SECRET=xxx

# Application
NODE_ENV=production
APP_URL=https://invoice.yourdomain.com
API_URL=https://api.invoice.yourdomain.com

# n8n
N8N_WEBHOOK_URL=https://n8n.invoice.yourdomain.com/webhook
```

## 🚀 Deployment Commands

### Initial Deployment
```bash
# Build and push Docker image
docker build -t invoice-app .
docker tag invoice-app:latest xxx.dkr.ecr.us-east-1.amazonaws.com/invoice-app:latest
docker push xxx.dkr.ecr.us-east-1.amazonaws.com/invoice-app:latest

# Deploy to Lightsail
ssh ubuntu@lightsail-ip "cd /opt/invoice-app && docker-compose pull && docker-compose up -d"
```

### Database Migration
```bash
# Run Prisma migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Seed initial data
npx prisma db seed
```

## ✅ Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test database connectivity
- [ ] Verify S3 bucket permissions
- [ ] Test Cognito authentication flow
- [ ] Verify CloudWatch metrics
- [ ] Test load balancer health checks
- [ ] Verify SSL certificates
- [ ] Test backup and restore procedures
- [ ] Run security scan
- [ ] Document API endpoints

## 📞 Support & Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check security groups and RDS endpoint
2. **S3 Access Denied**: Verify IAM roles and bucket policies
3. **Cognito Auth Failed**: Check app client settings and callback URLs
4. **High CPU Usage**: Scale up Lightsail instance or optimize queries

### Monitoring URLs
- CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch
- RDS Console: https://console.aws.amazon.com/rds
- Lightsail Console: https://lightsail.aws.amazon.com

### Emergency Contacts
- AWS Support: https://console.aws.amazon.com/support
- On-Call Engineer: [Configure PagerDuty integration]