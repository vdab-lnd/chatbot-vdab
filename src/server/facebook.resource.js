import Botkit from 'botkit';
import request from 'request';

export default class FacebookResource {

    constructor(webserver, witService) {
        this.webserver = webserver;
        this.witService = witService;
    }

    startResource(accessToken, verifyToken) {
        let controller = Botkit.facebookbot({
            verify_token: verifyToken,
            access_token: accessToken,
            json_file_store: './storage',
            port: '3000',
            hostname: 'localhost'
        });
        let bot = controller.spawn({});

        this.addGreeting(accessToken);
        this.login(accessToken, () => {
            controller.startTicking();
        });

        controller.createWebhookEndpoints(this.webserver.server, bot);
        controller.hears(['(.*)'], 'message_received', (bot, message) => this.handleMessageReceived(bot, message));
    }

    handleMessageReceived(bot, message) {
        this.witService.handleMessageReceived(message.text, message.user, (reply) =>
            bot.reply(message, FacebookResource.mapToFacebookResponse(reply))
        );
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
    }

    addGreeting(access_token) {
        request.post('https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + access_token,
            {
                form: {
                    setting_type: 'greeting',
                    greeting: {
                        text: 'hallo {{user_full_name}} welkom bij de chatbot van de vdab.'
                    }
                }
            },
            (err, res, body) => {
                if (err) {
                    console.log('Could not set setting to page messages');
                } else {
                    console.log('Successfully set Facebook settings:', body);
                }
            });
    }

    static mapToFacebookResponse(reply) {
        let response = {};
        response.text = reply.text;
        if (reply.quickreplies) {
            response.quick_replies = FacebookResource.mapToQuickReplies(reply.quickreplies);
        }
        console.log(`response ${JSON.stringify(reply)}`);
        return response;
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
}
