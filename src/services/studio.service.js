const fetch = require("node-fetch");
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const headers = {
    "Authorization": envVars.STUDIO_AUTH_KEY,
    "Content-Type": "application/json"
};
const topicClassifier = async (sampleTopics, userInputSummary) => {
    const promptTrigger = "The topic of the chat base on given topics above:";
    const combinedPrompt = sampleTopics + '\n' + userInputSummary + '\n' + promptTrigger + '\n';
    return fetch("https://api.ai21.com/studio/v1/j1-jumbo/complete", {
        headers: headers,
        body: JSON.stringify({
            "prompt": combinedPrompt,
            "numResults": 1,
            "maxTokens": 10,
            "temperature": 0,
            "topKReturn": 0,
            "topP": 1,
            "countPenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "frequencyPenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "presencePenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "stopSequences": ["==="]
        }),
        method: "POST"
    }).then(res => res.json());
};
const customerChatService = async (inquiryTopicPrompt, userInput) => {
    const promptTrigger = "Mary:";
    const combinedPrompt = inquiryTopicPrompt + ' ' + userInput + '\n' + promptTrigger;
    console.log(combinedPrompt);
    return fetch("https://api.ai21.com/studio/v1/j1-jumbo/complete", {
        headers: headers,
        body: JSON.stringify({
            "prompt": combinedPrompt,
            "numResults": 1,
            "maxTokens": 100,
            "temperature": 0.5,
            "topKReturn": 0,
            "topP": 0.9,
            "countPenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "frequencyPenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "presencePenalty": {
                "scale": 0,
                "applyToNumbers": false,
                "applyToPunctuations": false,
                "applyToStopwords": false,
                "applyToWhitespaces": false,
                "applyToEmojis": false
            },
            "stopSequences": ["User:", "==="]
        }),
        method: "POST"
    }).then(res => res.json());
};

const generateQuestionTopics = async (userQuestionTopicPrompt, userInput) => {
    const promptTrigger = "topics:";
    const combinedPrompt = userQuestionTopicPrompt + ' ' + userInput + '\n' + promptTrigger;
    console.log(combinedPrompt);
    return fetch("https://api.ai21.com/studio/v1/j1-large/complete", {
    headers: headers,
    body: JSON.stringify({
        "prompt": combinedPrompt,
        "numResults": 1,
        "maxTokens": 10,
        "temperature": 0,
        "topKReturn": 0,
        "topP":1,
        "countPenalty": {
            "scale": 0,
            "applyToNumbers": false,
            "applyToPunctuations": false,
            "applyToStopwords": false,
            "applyToWhitespaces": false,
            "applyToEmojis": false
        },
        "frequencyPenalty": {
            "scale": 0,
            "applyToNumbers": false,
            "applyToPunctuations": false,
            "applyToStopwords": false,
            "applyToWhitespaces": false,
            "applyToEmojis": false
        },
        "presencePenalty": {
            "scale": 0,
            "applyToNumbers": false,
            "applyToPunctuations": false,
            "applyToStopwords": false,
            "applyToWhitespaces": false,
            "applyToEmojis": false
        },
        "stopSequences":["==="]
        }),
    method: "POST"
    }).then(res => res.json());
};

module.exports = {
    topicClassifier,
    customerChatService,
    generateQuestionTopics
};
