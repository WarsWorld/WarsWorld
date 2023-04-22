terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "eu-west-1"
}

resource "aws_key_pair" "deployer" {
  key_name   = "ww-deployer-key"
  public_key = var.ssh_key
}

resource "aws_instance" "game_server" {
  ami             = var.ami
  instance_type   = "t3.small"
  key_name        = aws_key_pair.deployer.key_name
  security_groups = [
    aws_security_group.node_sg.name
  ]
  user_data_replace_on_change = true
  user_data                   = <<-EOF
#!/bin/bash
set -euo pipefail
yum install git -y
echo "export NEXTAUTH_SECRET=${var.nextauth_secret}" >> /home/ec2-user/.bashrc
echo "export DATABASE_URL=postgresql://${local.db_user}:${var.db_pw}@${aws_db_instance.ww_db.endpoint}" >> /home/ec2-user/.bashrc
echo "export WS_URL=ws://localhost:3001" >> /home/ec2-user/.bashrc
echo "export NEXTAUTH_URL=http://localhost:3000/api/auth" >> /home/ec2-user/.bashrc
su - ec2-user -c "
  set -euo pipefail
  curl https://nodejs.org/dist/v18.16.0/node-v18.16.0-linux-x64.tar.xz | tar -xJ
  echo 'export PATH="\$PATH:/home/ec2-user/node-v18.16.0-linux-x64/bin"' >> /home/ec2-user/.bashrc
  cat /home/ec2-user/.bashrc
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  source .bashrc
  node --version
  git clone https://github.com/WarsWorld/WarsWorld.git
  cd WarsWorld
  pnpm i
  pnpm build
  echo 'build done'
  pnpm start
"
EOF

  tags = {
    Name = "ww-server"
  }
}

locals {
  db_user = "db_user"
}
resource "aws_db_instance" "ww_db" {
  allocated_storage      = 10
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "13.3"
  instance_class         = "db.t3.micro"
  username               = local.db_user
  password               = var.db_pw
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name = "ww-db"
  }
}


resource "aws_security_group" "node_sg" {
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "node_sg"
  }
}

resource "aws_security_group" "db_sg" {
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.node_sg.id] // Allow server SG to call this SG
  }
  tags = {
    Name = "db_sg"
  }
}

#### Outputs ####

output "ip" {
  value = aws_instance.game_server.public_ip
}
output "url" {
  value = "http://${aws_instance.game_server.public_dns}:3000"
}

output "ssh_cmd" {
  value = "ssh -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' ${var.ssh_extra_args} ec2-user@${aws_instance.game_server.public_ip}"
}


