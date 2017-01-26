import Botkit from 'botkit';
import request from 'request';

export default class FacebookServer {

    constructor(webserver, witService, conversationService) {
        this.webserver = webserver;
        this.witService = witService;
        this.conversationService = conversationService;
    }

    startServer(accessToken, verifyToken) {
        let controller = Botkit.facebookbot({
            verify_token: verifyToken,
            access_token: accessToken,
            json_file_store: './storage',
            port: '3000',
            hostname: 'localhost'
        });
        let bot = controller.spawn({});

        this.login(accessToken, () => {
            controller.startTicking();
        });
        controller.createWebhookEndpoints(this.webserver.server, bot);

        controller.hears(['(.*)'], 'message_received', (bot, message) => {
            this.conversationService.handleRequest({text: message.text, userId: message.user}, (reply) => {
                let response = {};
                response.text = reply.text;
                if (reply.quickReplies) {
                    response.quick_replies = FacebookServer.mapToQuickReplies(reply.quickReplies);
                }
                bot.reply(message, response);
            });
        });

    }

    static mapToQuickReplies(quickReplies) {
        return quickReplies.map((reply) => {
            return {
                content_type: 'text',
                title: reply,
                payload: reply
            };
        });
    }

    login(access_token, callBack) {
        request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + access_token,
            (err, res, body) => {
                if (err) {
                    console.log('Could not subscribe to page messages');
                } else {
                    console.log('Successfully subscribed to Facebook events:', body);
                    callBack();
                }
            });
        return this;
    }
}