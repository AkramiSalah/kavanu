import { DynamoDBClient, DeleteTableCommand, CreateTableCommand, DescribeTableCommand, DescribeTimeToLiveCommand, UpdateTimeToLiveCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000', // Use environment variable for local DynamoDB
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const resetTable = async (event) => {
    try {
        const tableName = event.queryStringParameters.table;
        const isCreateAgain = event.queryStringParameters?.isCreateAgain;

        const [ttlAttributeName, tableSchema] = await Promise.all([
            setTTLConfiguration(tableName),
            getTableSchema(tableName),
        ]);
       
        if (!tableSchema) return { statusCode: 500, body: 'Table schema retrieval failed' };

        await deleteTable(tableName);

        if (!isCreateAgain) return { statusCode: 200, body: 'Table has been deleted successfully' };;

        await createTable(tableSchema, tableName);
        await reApplyTTL(ttlAttributeName, tableName);

        return { statusCode: 200, body: 'Table has been reset successfully' };
    } 
    catch (error) {
        console.error(`Error in Lambda function: ${error}`);
        return { statusCode: 500, body: 'Internal server error' };
    }
};


const getTableSchema = async (tableName) => {
    try {
        const response = await ddbClient.send(new DescribeTableCommand({ TableName: tableName }));
        return response.Table;
    } 
    catch (error) {
        console.error(`Error describing table: ${error}`);
        throw new Error('Failed to describe table');
    }
};

const setTTLConfiguration = async (tableName) => {
    try {
        const response = await ddbClient.send(new DescribeTimeToLiveCommand({ TableName: tableName }));
        return response.TimeToLiveDescription.AttributeName;
    } 
    catch (error) {
        console.error(`Error describing TTL: ${error}`);
        throw new Error('Failed to describe TTL');
    }
};

const deleteTable = async (tableName) => {
    try {
        await ddbClient.send(new DeleteTableCommand({ TableName: tableName }));
        console.log(`Table ${tableName} deleted successfully`);
    } 
    catch (error) {
        console.error(`Error deleting table: ${error}`);
        throw new Error('Failed to delete table');
    }
};

const createTable = async (schema, tableName) => {
    try {
        const params = {
            TableName: tableName,
            AttributeDefinitions: schema.AttributeDefinitions,
            KeySchema: schema.KeySchema,
            ProvisionedThroughput: schema.ProvisionedThroughput
        };

        await ddbClient.send(new CreateTableCommand(params));
        console.log(`Table ${tableName} created successfully`);
    } 
    catch (error) {
        console.error(`Error creating table: ${error}`);
        throw new Error('Failed to create table');
    }
};

const reApplyTTL = async (ttlAttributeName, tableName) => {
    try {
        if (ttlAttributeName) {
            await ddbClient.send(new UpdateTimeToLiveCommand({
                TableName: tableName,
                TimeToLiveSpecification: {
                    Enabled: true,
                    AttributeName: ttlAttributeName
                }
            }));
            console.log(`TTL re-applied successfully`);
        }
    } 
    catch (error) {
        console.error(`Error reapplying TTL: ${error}`);
        throw new Error('Failed to reapply TTL');
    }
};