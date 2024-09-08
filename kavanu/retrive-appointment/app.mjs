import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const retriveAppointment = async (event) => {
    const {
      phoneNumber,
      timestamp
    }= JSON.parse(event.body);

    const params = {
        TableName: "Barber",
        Key:{
            phone_number: {S: phoneNumber},
            appointment_timestamp: {S: timestamp }
        }
    }

    try{
        const data = client.send(new GetItemCommand(params));
        console.log('result : ' + JSON.stringify(data));
    }catch (error){
        console.error("Error : ", error);
    }
};

