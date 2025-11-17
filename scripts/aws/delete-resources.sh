# aws cloudformation delete-stack --stack-name FlowaiAppStack
aws ecr delete-repository --repository-name flowai-backend-repository --force
# aws ecr delete-repository --repository-name flowai-frontend-repository --force
# aws ecr describe-repositories --output json | jq -re ".repositories[].repositoryName"