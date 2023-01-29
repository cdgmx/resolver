const { customerServiceTopics } = require('../prompts/classifyTopics.js');
const { inquiryTopicPrompt, maryBotPrompt, sampleConversation} = require('../prompts/customerService.js');
const { userQuestionTopicPrompt } = require('../prompts/generativeLabeler');
const fetch = require("node-fetch");
const catchAsync = require("../utils/catchAsync.js");
const { topicClassifier, customerChatService, generateQuestionTopics } = require("../services/studio.service.js");
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

//should have weights

// options_and_rates: 0.5,
// tracking: 0.5,
// shipping_policy: 0.5,


//q: Hello can I as how much is this shipping?
//tags: shipping, shipping_rates
//generate a promptknowledgebase to send to api

const knowledgeBase = [
    {
    question: "How can I track my order on your website? You can track your order on our website by logging into your account and viewing the 'Order History' section. Here, you will be able to see a list of all your past and current orders, along with their status and tracking information. If you do not have an account, you can also track your order by using the tracking number provided in your order confirmation email. Additionally, you can contact customer service for assistance with tracking your order.",
    topic: ["order-tracking", "online-shopping", "order-history"]
    },
    {
    question: "I received a damaged product, how can I return it? If you received a damaged product, you can return it for a refund or exchange by following the instructions on our website's 'Returns' page. You will need to provide a photo of the damaged product and fill out a return form. Once we receive the returned item, we will process your refund or send you a replacement product. Additionally, you can contact customer service for assistance with the return process.",
    topic: ["returns", "damaged-products", "refunds", "exchanges"]
    },
    {
    question: "Can I change my shipping address after my order has been placed? It depends on the status of your order. If your order has not been shipped yet, you can change your shipping address by logging into your account and updating your address in the 'Account Information' section. If your order has already been shipped, you will need to contact customer service for assistance with changing the shipping address. Please note that we may not be able to change the address depending on the shipping carrier's policies.",
    topic: ["shipping", "order-placement", "shipping-address", "account"]
    },
    {
    question: "What are the payment options available on your website? We accept a variety of payment options on our website including credit and debit cards, PayPal, and Amazon Pay. Additionally, we offer the option to pay with store credit if you have any available in your account. If you have any issues with payment, you can contact customer service for assistance.",
    topic: ["payment-options", "online-shopping", "credit-and-debit-cards", "paypal", "amazon-pay", "store-credit"]
    },
    {
    question: "Are there any discounts or promotions currently available? We frequently offer discounts and promotions on our website. You can find the current discounts and promotions by visiting the Sales' or 'Promotions' page on our website. You can also sign up for our newsletter to receive notifications about upcoming sales and promotions. Additionally, you can contact customer service for more information about current discounts and promotions.",
    topic: ["discounts", "promotions", "sales"]
    },
    {
    question: "What is the return policy for your products? Our return policy allows for customers to return products within 30 days of purchase for a refund or exchange. Items must be in their original condition and packaging. Custom-made or final sale items are not eligible for return. Please visit our website's 'Returns' page for more information and to initiate a return. You can also contact customer service for assistance.",
    topic: ["return-policy", "returns", "refunds", "exchanges", "custom-made-items", "final-sale-items"]
    }
]

const knowledgeBaseTopics = [
    "order-tracking", "online-shopping", "order-history",
    "returns", "damaged-products", "refunds", "exchanges",
    "shipping", "order-placement", "shipping-address",
    "payment-options", "online-shopping", "credit-and-debit-cards", "paypal", "amazon-pay", "store-credit",
    "discounts", "promotions", "sales",
]



const topics = ["Inquiry", "Billing", "Technical Support", "Order Tracking"];


const postPrompt2 = catchAsync(async (req, res) => {
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

const postPrompt = catchAsync(async (req, res) => {
    const userInput = req.body.userInput;
    // should return array of string topics
    const questionTopicsResult = await generateQuestionTopics(userQuestionTopicPrompt,userInput).then(res => {
        const topics = res.completions[0].data.text;
        //convert topics to array of strings, remove white space and spaces and convert to lower case
        return topics.split(',').map(topic => topic.toLowerCase().replace(/\s/g, ''));
    });
    //match the result to the knowledgeBaseTopics array, return array of questions that match the topics.
        //check if any of questionTopicsResult is in question.topic
    //example of questionTopicsResult ["order-tracking", "online-shopping", "order-history"]
    const questionsCompilation = knowledgeBase.filter(question => questionTopicsResult.some(topic => question.topic.includes(topic)));

    console.log(questionsCompilation);
    const inquiryPrompt = maryBotPrompt + '\n' + questionsCompilation.map(question => question.question).join('\n\n') + sampleConversation;

    const inquiryResult = await customerChatService(inquiryPrompt, userInput).then(res => res.completions[0].data.text);

    // const inquiryResult = customerChatService(questionsCompilation, userInput).then(res => res.completions[0].data.text);
    // console.log(inquiryResult);
    res.send(inquiryResult);
});

module.exports = {
    postPrompt
};
