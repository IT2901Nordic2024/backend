# Backend README

## For non-backend devs

### habit-storage

This stack uses API Gateway, DynamoDB and Lambda to get and update the users habit. Format for different HTTP routes below

**Getting all data from all users**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habits

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID

**Getting data from a specific user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habits/{userId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to get the data from. Currently, we only have one user with id 0
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456

**Adding a new habit for a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/createHabit/{userId}/{deviceId}/{habitName}/{habitType}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0
- {deviceId} is the id of the device the user wants to track this habit with
- {habitName} is the name of the habit the user want to track
- {habitType} is the type tracking the user want to do for the habit. Currently we only support "count" and "time"
- The "{}" brackets should not be included in the url, just write 0/TestDK/treehugging/time

### configure-shadow-api

This is an API for configuring the shadow of a users device. Format for HTTP request below

**Updating device shadow**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/updateshadow/{deviceId}/{updatedSide}/{relatedHabitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID
- {deviceId} is ID of device you want to update
- {updatedSide} is the device side you want to add a new habit to
- {relatedActivityId} is the ID of the new habit you want to track
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456

**Getting device shadow**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getshadow/{deviceId}

- {deviceId} is ID of device you want to update
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID

## For real devs

### Creating new stacks

**Step 1**

Create the stack itself using this guide: https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html

**Step 2**

Add ESLint by following the quick start here: https://eslint.org/docs/latest/use/getting-started

**Step 3**

Copy the .prettierrc from an earlier stack to your new stack

**Step 4**

Start coding :)
