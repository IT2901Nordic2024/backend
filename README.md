# Backend README

## habit-storage

This stack uses API Gateway to make Lambda interract with DynamoDB in a way that lets it GET saved data. This is used by the frontend in order to show the user's data

## configure-shadow-api

This is an API for configuring the shadow of a users device. When developing, you will need a .env file containing ACCOUTNID = YOUR-AWS-ACCOUNT-ID