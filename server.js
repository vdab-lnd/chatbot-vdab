const slackServer = require('./src/server/slack.server');
const facebookServer = require('./src/server/facebook.server');
const propertiesService = require('./src/storage/properties.service');
const apiAiWebhook = require('./src/webhook/api.ai.webhook');

class Server {
    constructor(slackServer, facebookServer, propertiesService) {
        this.slackServer = slackServer;
        this.facebookServer = facebookServer;
        this.propertiesService = propertiesService;
    }

    $onInit() {
        let facebookAccessToken = this.propertiesService.get('facebook.access.token');
        let facebookVerifyToken = this.propertiesService.get('facebook.verify.token');
        let slackVerifyToken = this.propertiesService.get('slack.verify.token');
        let slackClientId = this.propertiesService.get('slack.client.id');
        let slackClientSecret = this.propertiesService.get('slack.client.secret');
        this.slackServer.startServer(slackClientId, slackClientSecret, slackVerifyToken);
        this.facebookServer.startServer(facebookAccessToken, facebookVerifyToken);
    }
}

const server = new Server(slackServer, facebookServer, propertiesService);
server.$onInit();