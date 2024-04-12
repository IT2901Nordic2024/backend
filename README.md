# Backend README

## For non-backend devs

### General info

Each of the stacks below has its own API-id. The ids can be found in the AWS API Gateway console. Ask your local backend dev if you can find the API id, and he will happily help you.

### habit-storage

This stack uses API Gateway, DynamoDB and Lambda to get and update the users habit. Format for different HTTP routes below

**Getting all userdata (including habits) from user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitsWithSide/{userId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to get the data from. Currently, we only have one user with id 0. His name is Frode
- The "{}" brackets should not be included in the url, just write getHabitsWithSide/0

**Adding a new habit to a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0
- {deviceId} is the id of the device the user wants to track this habit with
- {habitName} is the name of the habit the user want to track
- {habitType} is the type tracking the user want to do for the habit. Currently we only support "count" and "time"
- {deviceSide} is the side of the device you want to connect to. This is 0-indexed and works with all numbers from 0 to 11
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/treehugging/time

**Editing a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}

- IMPORTANT: If you're not going to change habitName or deviceSIde, set them as "noChange"
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0
- {deviceId} is the id of the device the user wants to track this habit with
- {habitId} is the id of the habit you want to change
- {habitName} is the name of the habit the user want to track
- {deviceSide} is the side of the device you want to connect to. This is 0-indexed and works with all numbers from 0 to 11
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/174324234/treehugging/4

**Deleting a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/deleteHabit/{userId}/{habitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0
- {habitId} is the id of the habit you want to remove
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/174324234/treehugging/4

### habit-event-storage

This contains all the habit events for the users

**Getting data from user with a specific habitId**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitEvents/{userId}/{habitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0
- {habitId} is the id of the new habit you want to track

**Getting all habit events from specific user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitEvents/{userId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID
- {userId} is the id of the user you want to add a new habit to. Currently, we only have one user with id 0

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
