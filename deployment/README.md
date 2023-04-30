# Deployment

This is work-in-progress and not production ready yet.

## Prerequisites

- Install terraform https://developer.hashicorp.com/terraform/downloads?product_intent=terraform
- Set up an AWS account, set up AWS credentials
- Generate an SSH key
- Edit variables.tf according to instructions

## Deploy or update:

`terraform apply`

The command outputs an ssh command to connect to the node.
From the node, you can run `tail -f /var/log/cloud-init-output.log` to monitor
the progress of the installation process.

The URL to the app is also printed. It will take a while before it responds, since it's installing all dependencies.

## Tear down:

`terraform destroy`

## Recommended reading

https://developer.hashicorp.com/terraform/tutorials/aws-get-started

https://registry.terraform.io/providers/hashicorp/aws/latest/docs
