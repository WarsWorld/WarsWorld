variable "ssh_key" {
  type        = string
  default     = "ADD YOUR SSH PUBKEY HERE"
}
variable "db_pw" {
  type        = string
  default     = "REPLACEME_67135de3-f0ee-4e37-99bf-59563eaec6d7"
}
variable "nextauth_secret" {
  type        = string
  default     = "REPLACEME_cb57cb26-c106-40f7-a182-f8341db49e22"
}

variable "ssh_extra_args" {
  type        = string
  default     = ""
  # Optional, but might be needed if you have multiple keys
  # Example: "-i ~/.ssh/my_ssh_key"
}
variable "ami" {
  type        = string
  default     = "ami-04f1014c8adcfa670" # AWS Linux in eu-west-1
  // https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#AMICatalog:
}
