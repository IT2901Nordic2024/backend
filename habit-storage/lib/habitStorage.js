"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitStorage = void 0;
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const lambda = require("aws-cdk-lib/aws-lambda");
const constructs_1 = require("constructs");
const iam = require("aws-cdk-lib/aws-iam");
/**
 * This file contains the table for storing diffrent habits, and a handler for interracting with it
 */
class HabitStorage extends constructs_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        // Creating role for createHabit
        const createHabitHandlerRole = new iam.Role(this, 'CreateHabitHandlerRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            roleName: 'CreateHabitHandlerRole',
        });
        // Attaching policy to createHabit-role
        createHabitHandlerRole.attachInlinePolicy(new iam.Policy(this, 'IotShadowRestPolicy', {
            policyName: 'IotShadowRestPolicy',
            statements: [
                new iam.PolicyStatement({
                    actions: ['iot:GetThingShadow', 'iot:UpdateThingShadow'],
                    resources: ['arn:aws:iot:eu-north-1:339713040007:thing/*'],
                }),
                new iam.PolicyStatement({
                    actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'],
                    resources: ['arn:aws:logs:*:*:*'],
                }),
                new iam.PolicyStatement({
                    actions: ['dynamodb:*'],
                    resources: ['arn:aws:dynamodb:eu-north-1:339713040007:*'],
                }),
            ],
        }));
        // Creating DynamoDB table. Sort key is included in case more than one row is needed
        const userDataTable = new dynamodb.Table(this, 'UserDataTable', {
            tableName: 'UserDataTable',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
        });
        const deviceIdIndex = {
            indexName: 'deviceIdIndex',
            partitionKey: {
                name: 'deviceId',
                type: dynamodb.AttributeType.STRING,
            },
        };
        userDataTable.addGlobalSecondaryIndex(deviceIdIndex);
        // Handlers for interracting with DynamoDB table
        const getHabitWithSide = new lambda.Function(this, 'GetHabitWithSideFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'getHabitsWithSide.handler',
            code: lambda.Code.fromAsset('lambda'),
            functionName: 'GetHabitWithSide',
            role: createHabitHandlerRole,
            environment: {
                USER_DATA_TABLENAME: userDataTable.tableName,
            },
        });
        const createHabitHandler = new lambda.Function(this, 'CreateHabitHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'createHabit.handler',
            code: lambda.Code.fromAsset('lambda'),
            functionName: 'CreateHabit',
            role: createHabitHandlerRole,
            environment: {
                USER_DATA_TABLENAME: userDataTable.tableName,
                HABIT_EVENT_TABLENAME: 'HabitEventTable',
            },
        });
        const editHabitHandler = new lambda.Function(this, 'EditHabitHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'editHabit.handler',
            functionName: 'EditHabitHandler',
            role: createHabitHandlerRole,
            environment: {
                USER_DATA_TABLENAME: userDataTable.tableName,
            },
        });
        const deleteHabitHandler = new lambda.Function(this, 'DeleteHabitHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'deleteHabit.handler',
            functionName: 'DeleteHabitHandler',
            role: createHabitHandlerRole,
            environment: {
                USER_DATA_TABLENAME: userDataTable.tableName,
                HABIT_EVENT_TABLENAME: 'HabitEventTable',
            },
        });
        // Setting the table and handler for this construct
        this.table = userDataTable;
        this.createHabitHandler = createHabitHandler;
        this.getHabitsWithSideHandler = getHabitWithSide;
        this.editHabitHandler = editHabitHandler;
        this.deleteHabitHandler = deleteHabitHandler;
        // Granting handler read and write access to the table
        userDataTable.grantReadWriteData(this.createHabitHandler);
        userDataTable.grantReadWriteData(this.editHabitHandler);
        userDataTable.grantReadData(this.getHabitsWithSideHandler);
        userDataTable.grantReadWriteData(this.deleteHabitHandler);
    }
}
exports.HabitStorage = HabitStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFiaXRTdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFiaXRTdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFvRDtBQUNwRCxpREFBZ0Q7QUFDaEQsMkNBQXNDO0FBQ3RDLDJDQUEwQztBQUUxQzs7R0FFRztBQUVILE1BQWEsWUFBYSxTQUFRLHNCQUFTO0lBUXpDLFlBQVksS0FBZ0IsRUFBRSxFQUFVO1FBQ3RDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFaEIsZ0NBQWdDO1FBQ2hDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUMxRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDM0QsUUFBUSxFQUFFLHdCQUF3QjtTQUNuQyxDQUFDLENBQUE7UUFFRix1Q0FBdUM7UUFDdkMsc0JBQXNCLENBQUMsa0JBQWtCLENBQ3ZDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDMUMsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO29CQUN0QixPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSx1QkFBdUIsQ0FBQztvQkFDeEQsU0FBUyxFQUFFLENBQUMsNkNBQTZDLENBQUM7aUJBQzNELENBQUM7Z0JBQ0YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO29CQUN0QixPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSx5QkFBeUIsQ0FBQztvQkFDeEcsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7aUJBQ2xDLENBQUM7Z0JBQ0YsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO29CQUN0QixPQUFPLEVBQUUsQ0FBQyxZQUFZ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a0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7UUFDNUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLGdCQUFnQixDQUFBO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtRQUN4QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7UUFFNUMsc0RBQXNEO1FBQ3RELGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUN6RCxhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDdkQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUMxRCxhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFDM0QsQ0FBQztDQUNGO0FBckhELG9DQXFIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYidcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xuXG4vKipcbiAqIFRoaXMgZmlsZSBjb250YWlucyB0aGUgdGFibGUgZm9yIHN0b3JpbmcgZGlmZnJlbnQgaGFiaXRzLCBhbmQgYSBoYW5kbGVyIGZvciBpbnRlcnJhY3Rpbmcgd2l0aCBpdFxuICovXG5cbmV4cG9ydCBjbGFzcyBIYWJpdFN0b3JhZ2UgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAvLyBNYWtpbmcgaGFuZGxlciBhbmQgdGFibGUgcHVibGljIGZvciBhbGxcbiAgcHVibGljIHJlYWRvbmx5IHRhYmxlOiBkeW5hbW9kYi5UYWJsZVxuICBwdWJsaWMgcmVhZG9ubHkgZ2V0SGFiaXRzV2l0aFNpZGVIYW5kbGVyOiBsYW1iZGEuRnVuY3Rpb25cbiAgcHVibGljIHJlYWRvbmx5IGNyZWF0ZUhhYml0SGFuZGxlcjogbGFtYmRhLkZ1bmN0aW9uXG4gIHB1YmxpYyByZWFkb25seSBlZGl0SGFiaXRIYW5kbGVyOiBsYW1iZGEuRnVuY3Rpb25cbiAgcHVibGljIHJlYWRvbmx5IGRlbGV0ZUhhYml0SGFuZGxlcjogbGFtYmRhLkZ1bmN0aW9uXG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKHNjb3BlLCBpZClcblxuICAgIC8vIENyZWF0aW5nIHJvbGUgZm9yIGNyZWF0ZUhhYml0XG4gICAgY29uc3QgY3JlYXRlSGFiaXRIYW5kbGVyUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnQ3JlYXRlSGFiaXRIYW5kbGVyUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgcm9sZU5hbWU6ICdDcmVhdGVIYWJpdEhhbmRsZXJSb2xlJyxcbiAgICB9KVxuXG4gICAgLy8gQXR0YWNoaW5nIHBvbGljeSB0byBjcmVhdGVIYWJpdC1yb2xlXG4gICAgY3JlYXRlSGFiaXRIYW5kbGVyUm9sZS5hdHRhY2hJbmxpbmVQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeSh0aGlzLCAnSW90U2hhZG93UmVzdFBvbGljeScsIHtcbiAgICAgICAgcG9saWN5TmFtZTogJ0lvdFNoYWRvd1Jlc3RQb2xpY3knLFxuICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgYWN0aW9uczogWydpb3Q6R2V0VGhpbmdTaGFkb3cnLCAnaW90OlVwZGF0ZVRoaW5nU2hhZG93J10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFsnYXJuOmF3czppb3Q6ZXUtbm9ydGgtMTozMzk3MTMwNDAwMDc6dGhpbmcvKiddLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnbG9nczpDcmVhdGVMb2dHcm91cCcsICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsICdsb2dzOlB1dExvZ0V2ZW50cycsICdsb2dzOkRlc2NyaWJlTG9nU3RyZWFtcyddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbJ2Fybjphd3M6bG9nczoqOio6KiddLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnZHluYW1vZGI6KiddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbJ2Fybjphd3M6ZHluYW1vZGI6ZXUtbm9ydGgtMTozMzk3MTMwNDAwMDc6KiddLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgLy8gQ3JlYXRpbmcgRHluYW1vREIgdGFibGUuIFNvcnQga2V5IGlzIGluY2x1ZGVkIGluIGNhc2UgbW9yZSB0aGFuIG9uZSByb3cgaXMgbmVlZGVkXG4gICAgY29uc3QgdXNlckRhdGFUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnVXNlckRhdGFUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ1VzZXJEYXRhVGFibGUnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgIH0pXG5cbiAgICBjb25zdCBkZXZpY2VJZEluZGV4OiBkeW5hbW9kYi5HbG9iYWxTZWNvbmRhcnlJbmRleFByb3BzID0ge1xuICAgICAgaW5kZXhOYW1lOiAnZGV2aWNlSWRJbmRleCcsXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogJ2RldmljZUlkJyxcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgIH1cblxuICAgIHVzZXJEYXRhVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoZGV2aWNlSWRJbmRleClcblxuICAgIC8vIEhhbmRsZXJzIGZvciBpbnRlcnJhY3Rpbmcgd2l0aCBEeW5hbW9EQiB0YWJsZVxuICAgIGNvbnN0IGdldEhhYml0V2l0aFNpZGUgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdHZXRIYWJpdFdpdGhTaWRlRnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgIGhhbmRsZXI6ICdnZXRIYWJpdHNXaXRoU2lkZS5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBmdW5jdGlvbk5hbWU6ICdHZXRIYWJpdFdpdGhTaWRlJyxcbiAgICAgIHJvbGU6IGNyZWF0ZUhhYml0SGFuZGxlclJvbGUsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEVOQU1FOiB1c2VyRGF0YVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGNvbnN0IGNyZWF0ZUhhYml0SGFuZGxlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NyZWF0ZUhhYml0SGFuZGxlcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgaGFuZGxlcjogJ2NyZWF0ZUhhYml0LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSxcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ0NyZWF0ZUhhYml0JyxcbiAgICAgIHJvbGU6IGNyZWF0ZUhhYml0SGFuZGxlclJvbGUsXG5cbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFVTRVJfREFUQV9UQUJMRU5BTUU6IHVzZXJEYXRhVGFibGUudGFibGVOYW1lLFxuICAgICAgICBIQUJJVF9FVkVOVF9UQUJMRU5BTUU6ICdIYWJpdEV2ZW50VGFibGUnLFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgY29uc3QgZWRpdEhhYml0SGFuZGxlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0VkaXRIYWJpdEhhbmRsZXInLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiAnZWRpdEhhYml0LmhhbmRsZXInLFxuICAgICAgZnVuY3Rpb25OYW1lOiAnRWRpdEhhYml0SGFuZGxlcicsXG4gICAgICByb2xlOiBjcmVhdGVIYWJpdEhhbmRsZXJSb2xlLFxuXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEVOQU1FOiB1c2VyRGF0YVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGNvbnN0IGRlbGV0ZUhhYml0SGFuZGxlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbGV0ZUhhYml0SGFuZGxlcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSxcbiAgICAgIGhhbmRsZXI6ICdkZWxldGVIYWJpdC5oYW5kbGVyJyxcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ0RlbGV0ZUhhYml0SGFuZGxlcicsXG4gICAgICByb2xlOiBjcmVhdGVIYWJpdEhhbmRsZXJSb2xlLFxuXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEVOQU1FOiB1c2VyRGF0YVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgSEFCSVRfRVZFTlRfVEFCTEVOQU1FOiAnSGFiaXRFdmVudFRhYmxlJyxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIC8vIFNldHRpbmcgdGhlIHRhYmxlIGFuZCBoYW5kbGVyIGZvciB0aGlzIGNvbnN0cnVjdFxuICAgIHRoaXMudGFibGUgPSB1c2VyRGF0YVRhYmxlXG4gICAgdGhpcy5jcmVhdGVIYWJpdEhhbmRsZXIgPSBjcmVhdGVIYWJpdEhhbmRsZXJcbiAgICB0aGlzLmdldEhhYml0c1dpdGhTaWRlSGFuZGxlciA9IGdldEhhYml0V2l0aFNpZGVcbiAgICB0aGlzLmVkaXRIYWJpdEhhbmRsZXIgPSBlZGl0SGFiaXRIYW5kbGVyXG4gICAgdGhpcy5kZWxldGVIYWJpdEhhbmRsZXIgPSBkZWxldGVIYWJpdEhhbmRsZXJcblxuICAgIC8vIEdyYW50aW5nIGhhbmRsZXIgcmVhZCBhbmQgd3JpdGUgYWNjZXNzIHRvIHRoZSB0YWJsZVxuICAgIHVzZXJEYXRhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMuY3JlYXRlSGFiaXRIYW5kbGVyKVxuICAgIHVzZXJEYXRhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMuZWRpdEhhYml0SGFuZGxlcilcbiAgICB1c2VyRGF0YVRhYmxlLmdyYW50UmVhZERhdGEodGhpcy5nZXRIYWJpdHNXaXRoU2lkZUhhbmRsZXIpXG4gICAgdXNlckRhdGFUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodGhpcy5kZWxldGVIYWJpdEhhbmRsZXIpXG4gIH1cbn1cbiJdfQ==