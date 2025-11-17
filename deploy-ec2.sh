#!/bin/bash

# Variables
AWS_REGION="eu-west-1"
INSTANCE_TYPE="t2.small"
KEY_NAME="ledger-key-pair"
SECURITY_GROUP="flowai-ec2-sg"
AMI_ID="ami-047bb4163c506cd98" # Ensure this is Amazon Linux 2
TAG_KEY="app"
TAG_VALUE="flowai"
DOCKER_COMPOSE_VERSION="1.29.2"
VOLUME_SIZE=50 # Increase this value as needed

# Create a key pair
if [ ! -f "$KEY_NAME.pem" ]; then
  echo "Creating a new key pair: $KEY_NAME"
  aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text --region $AWS_REGION > $KEY_NAME.pem
  chmod 400 $KEY_NAME.pem
else
  echo "Key pair $KEY_NAME already exists."
fi

# Create a security group
aws ec2 create-security-group --group-name $SECURITY_GROUP --description "Security group for Docker EC2 instance" --region $AWS_REGION

# Add rules to the security group
aws ec2 authorize-security-group-ingress --group-name $SECURITY_GROUP --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-name $SECURITY_GROUP --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-name $SECURITY_GROUP --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION  # Add HTTPS if needed

# Launch an EC2 instance with increased storage
INSTANCE_ID=$(aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type $INSTANCE_TYPE --key-name $KEY_NAME --security-groups $SECURITY_GROUP --block-device-mappings DeviceName=/dev/xvda,Ebs={VolumeSize=$VOLUME_SIZE} --tag-specifications "ResourceType=instance,Tags=[{Key=$TAG_KEY,Value=$TAG_VALUE}]" --query "Instances[0].InstanceId" --output text --region $AWS_REGION)

echo "Waiting for instance to be in running state..."
while state=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[0].Instances[0].State.Name" --output text --region $AWS_REGION); test "$state" = "pending"; do
  echo -n "."
  sleep 5
done

echo "Instance state: $state"

# Wait for the instance status checks to pass
echo "Waiting for instance status checks to pass..."
aws ec2 wait instance-status-ok --instance-ids $INSTANCE_ID --region $AWS_REGION

# Get the public DNS of the instance
INSTANCE_PUBLIC_DNS=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[0].Instances[0].PublicDnsName" --output text --region $AWS_REGION)

echo "Instance is running at $INSTANCE_PUBLIC_DNS"

# Add a delay to allow SSH service to start
echo "Waiting for SSH service to be ready..."
sleep 30

# SSH into the instance and set up Docker, Docker Compose
ssh -o "StrictHostKeyChecking=no" -i "$KEY_NAME.pem" ec2-user@$INSTANCE_PUBLIC_DNS << EOF
  sudo yum update -y
  sudo yum install -y docker
  sudo service docker start
  sudo usermod -a -G docker ec2-user
  sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  exit
EOF

# Copy all project files and directories except ledger-key-pair.pem and .venv
rsync -av --exclude="$KEY_NAME.pem" --exclude=".venv" -e "ssh -i $KEY_NAME.pem" ./ ec2-user@$INSTANCE_PUBLIC_DNS:~/project/

# Replace the placeholder in docker-compose.yml with the actual INSTANCE_PUBLIC_DNS
ssh -i "$KEY_NAME.pem" ec2-user@$INSTANCE_PUBLIC_DNS << EOF
  cd ~/project/deploy
  sed -i "s/{{INSTANCE_PUBLIC_DNS}}/$INSTANCE_PUBLIC_DNS/g" docker-compose.yml
  export DOCKER_DEFAULT_PLATFORM=linux/amd64
  docker-compose up -d
  exit
EOF

echo "Deployment complete. Access your app at http://$INSTANCE_PUBLIC_DNS"