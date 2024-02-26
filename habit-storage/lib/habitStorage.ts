import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs"

/**
 * This file contains the table for storing diffrent habits, and a handler for interracting with it
 */

export class HabitStorage extends Construct {
    // Making handler and table public for all 
    public readonly table: dynamodb.Table
    public readonly handler: lambda.Function

    constructor(scope: Construct, id: string){
        super(scope, id)

        // Creating DynamoDB table. Sort key is included in case more than one row is needed
        const habitTable = new dynamodb.Table(this, "habitTable", {
            tableName: "HabitTable",
            partitionKey: {name: "userId", type: dynamodb.AttributeType.NUMBER},
            sortKey: {name: "itemNumber", type: dynamodb.AttributeType.NUMBER}
        })

        // Handler for accessing DynamoDB table
        const handler = new lambda.Function(this, "postHandler", {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: "getHabits.handler",
            code: lambda.Code.fromAsset("lambda"),
            functionName: "getHabits",
            
            environment: {
                HABIT_TABLE_NAME: habitTable.tableName
            }
        })

        // Setting the table and handler for this construct
        this.table = habitTable
        this.handler = handler

        // Granting handler read and write access to the table
        habitTable.grantReadWriteData(this.handler);
    }
}