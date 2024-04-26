# Backend README

## For non-backend devs

### General info

Each of the stacks below has its own API-id. The ids can be found in the AWS API Gateway console. Ask your local backend dev if you can find the API id, and he will happily help you.

### habit-storage

This stack uses API Gateway, DynamoDB and Lambda to get and update the users habit. Format for different HTTP routes below

**Getting all userdata (including habits) from user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habits/{userId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to get the data from.
- The "{}" brackets should not be included in the url, just write getHabitsWithSide/0

**Adding a new habit to a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to add a new habit to.
- {deviceId} is the id of the device the user wants to track this habit with
- {habitName} is the name of the habit the user want to track
- {habitType} is the type tracking the user want to do for the habit. Currently we only support "count" and "time"
- {deviceSide} is the side of the device you want to connect to. This is 0-indexed and works with all numbers from 0 to 11
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/treehugging/time

**Editing a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}

- IMPORTANT: If you're not going to change habitName or deviceSide, set them as "noChange"
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to add a new habit to.
- {deviceId} is the id of the device the user wants to track this habit with
- {habitId} is the id of the habit you want to change
- {habitName} is the name of the habit the user want to track
- {deviceSide} is the side of the device you want to connect to. This is 0-indexed and works with all numbers from 0 to 11
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/174324234/treehugging/4

**Deleting a user's habit's name or deviceSide**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/deleteHabit/{userId}/{habitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to add a new habit to.
- {habitId} is the id of the habit you want to remove
- The "{}" brackets should not be included in the url, just write 0/MyIotThing/174324234/treehugging/4

### habit-event-storage

This contains all the habit events for the users. Also gives acces to getting and setting a habit's goals

**Getting data from user with a specific habitId**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitEvents/{userId}/{habitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitEventStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to get the habit from
- {habitId} is the id of the new habit you want to track
- The "{}" brackets should not be included in the url

**Getting all habit events from specific user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitEvents/{userId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitEventStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to get the habit from
- The "{}" brackets should not be included in the url

**Setting habit goal**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/setHabitGoal/{userId}/{habitId}/{question}/{target}/{unit}/{frequency}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitEventStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to add a new habit to.
- {habitId} is the id of the habit related to the habitgoal
- {question}/{target}/{unit}/{frequency} are all attributes to the habitgoal itself
- The "{}" brackets should not be included in the url

**Getting habit goal**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getHabitGoal/{userId}/{habitId}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitEventStorageHTTP. Ask you local Backend expert if you cant find the ID
- {userId} is the id of the user you want to add a new habit to.
- {habitId} is the id of the habit related to the habitgoal
- The "{}" brackets should not be included in the url

### user-pool

This stack is used for registering and authenticating users

**Registering a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/signup/{username}/{email}/{deviceId}/{password}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is AuthentificationAPI. Ask you local Backend expert if you cant find the ID
- {username} is the username the user wants. Keep in mind that this is unique across all users. WIll return an error if the chosen username already exists
- {email} is the email the user wants to register with. This must be unique across all users, and needs to be verified before a user can log in to their account. Use the API for verifying users to do confirm a users email
- {deviceId} is the id of the device the user wants to register with
- {password} is the password that the user wants for their account. It must be at least 6 characters long, and contain at least one lower case letter, one higher case letter and a number
- The "{}" brackets should not be included in the url

**Verifying a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/verifyUser/{username}/{confirmationCode}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is AuthentificationAPI. Ask you local Backend expert if you cant find the ID
- {username} is the username that the user chose to register with
- {confirmationCode} is the code that the user got sent to their email
- The "{}" brackets should not be included in the url

**Logging in a user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/login/{username}/{password}

- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is AuthentificationAPI. Ask you local Backend expert if you cant find the ID
- {username} is the username or email that the user tries to log in with
- {password} is the password associated with the inputted username
- The "{}" brackets should not be included in the url

This API will return the user-sub of the user that logs in. It may look like this 406c393c-9021-7072-96f3-e71901a8f1ff. This is the userId of the logged in user

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
