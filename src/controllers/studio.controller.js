const { customerServiceTopics } = require('../prompts/classifyTopics.js');
const { inquiryTopicPrompt } = require('../prompts/customerService.js');
const fetch = require("node-fetch");
const catchAsync = require("../utils/catchAsync.js");
const { topicClassifier, customerChatService } = require("../services/studio.service.js");
const { from } = require('form-data');

// const retryOnFailOrTimeout = async (message, retriesLeft = 3, timeout = 5000) => {
//     let chatgptResult;
//     const api = new ChatGPTAPIBrowser({
   
//     });
//     while (retriesLeft) {
//         try {
//             await api.initSession();
//             chatgptResult = await api.sendMessage(message);
//             break;
//         }
//         catch (error) {
//             retriesLeft -= 1;
//         }
//     }
//     if (!chatgptResult)
//         throw new Error('Retries exhausted');
//     return chatgptResult;
// };

const topics = ["Inquiry", "Billing", "Technical Support", "Order Tracking"];
const postPrompt = catchAsync(async (req, res) => {
    const userInputSummary = req.body.userInput;
    const result = await topicClassifier(customerServiceTopics, userInputSummary).then(res => res.completions[0].data.text);
    //match the result to the topics array, disregard upper/lower case. remove white space and spaces
    console.log(result);
    const topic = topics.find(topic => topic.toLowerCase().replace(/\s/g, '') === result.toLowerCase().replace(/\s/g, ''));
    if (!topic) {
        res.send("Sorry, I don't understand your question. Can you rephrase?");
    }
    else {
        const inquiryResult = await customerChatService(inquiryTopicPrompt, userInputSummary).then(res => res.completions[0].data.text);
        console.log(inquiryResult);
        res.send(inquiryResult);
    }
});

module.exports = {
    postPrompt
};
