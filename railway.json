{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "runtime": "V2",
    "numReplicas": 1,
    "sleepApplication": false,
    "multiRegionConfig": {
      "us-west2": {
        "numReplicas": 1
      }
    },
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
