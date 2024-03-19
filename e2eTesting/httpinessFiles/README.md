# Testing guide and info

## What is httpiness

Httpiness is a postman-like tool for testing api endpoints. Keep in mind that this will create resources as if a user were to use it. More info about httpiness can be found on their [website](https://www.httpiness.com/)

## How to use existing tests

1. Download httpiness if you havent already downloaded it
2. Click either "Import existing collection" or "Import third-party collection"
3. Navigate to this folder and click one of the .json files. This .json file contains alle the tests for this collection
4. Fill out the API_ID field under parameters. This id can be found in your api-gateway console. You want to keep this secret, so click the "Toggle parameter lock" to the right on the "Parameters" field after you have filled in your api id
5. Click send request, and continue testing

## For learning to create tests

I think that httpiness does a better job than I at explaining this. Go to the [docs](https://www.httpiness.com/#/docs) and learn how to use the tool.
