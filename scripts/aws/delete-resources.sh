# aws cloudformation delete-stack --stack-name MinervaAppStack
aws ecr delete-repository --repository-name minerva-backend-repository --force
# aws ecr delete-repository --repository-name minerva-frontend-repository --force
# aws ecr describe-repositories --output json | jq -re ".repositories[].repositoryName"