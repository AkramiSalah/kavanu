import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const getTableItems = async (event) => { 
    const tableName = event.queryStringParameters.table;

    const scanTableCommand = new ScanCommand({
        TableName: tableName 
    });

    try {
        const table = await client.send(scanTableCommand);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Data retrieved successfully`,
                count: table.Items.length,
                items: table.Items,     
            }),
        };
    } 
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to retrieve data',
                error: error.message
            }),
        };
    }
};
