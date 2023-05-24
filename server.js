'use strict';

const dialogflow = require('@google-cloud/dialogflow')
const { WebBookClient, Payload, WebhookClient } = require('dialogflow-fulfillment')
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
var sessionClient = new dialogflow.SessionsClient();
const {
    Configuration,
    OpenAIApi
} = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: "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",
})
console.log(configuration.apiKey)

const openai = new OpenAIApi(configuration);

const textGeneration = async(prompt) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Human: ${prompt}\nAI:`,
            temperature: 0.9,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: ['Human', 'AI']
        });
        return {
            status: 1,
            response: `${response.data.choices[0].text}`
        }
    } catch (error) {
        return {
            status: 0,
            response: `  `
        };
    }
}
const webApp = express();
const PORT = process.env.PORT || 8000;
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with  Method ${req.method}`)
    next();
})
webApp.get('/', (req, res) => {
    res.sendStatus(200);
    res.send('Status Okay')
})
webApp.post('/dialogflow', async(req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({
        request: req,
        response: res
    });
    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText
        if (action === "input unknown") {
            let result = await textGeneration(queryText);
            if (result.status === 1) {
                agent.add(result.response);
            } else {
                agent.add("Sorry.Im not able to help with that");
            }
        }
    }

    function hi(agent) {
        console.log(intent => hi)
        agent.add["Hello Hi I am your Virtual asistant tell me how can I help you"]
    }
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap)
});
webApp.listen(PORT, () => {
    console.log(`Server is up and running at http://localhost:${PORT}/`)
})