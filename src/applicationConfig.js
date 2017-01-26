import SlackServer from './server/slack.server';
import FacebookServer from './server/facebook.server';
import ApiEndpoint from './ai/api.endpoint';
import WitService from './ai/wit.service';
import ConversationService from './conversation/conversation.service';
import ContextService from './context/context.repository';
import SessionService from './storage/session.repository';
import SenderService from './storage/sender.repository';
import PropertiesService from './storage/properties.service';
import ApiAiWebhook from './webhook/api.ai.webhook';
import BackendStub from './backend/backend.stub';
import ExpressServer from './server/web.server';

export default class ApplicationConfig {

    getSlackServer() {
        if (!this.slackServer) {
            this.slackServer = new SlackServer(this.getWebserver(), this.getWitService(), this.getApiEndpoint());
        }
        return this.slackServer;
    }

    getFacebookServer() {
        if (!this.facebookServer) {
            this.facebookServer = new FacebookServer(this.getWebserver(), this.getWitService(), this.getConversationService());
        }
        return this.facebookServer;
    }

    getApiEndpoint() {
        if (!this.apiService) {
            this.apiService = new ApiEndpoint(this.getPropertiesService().get('api.ai.access.token'));
        }
        return this.apiService;
    }

    getWitService() {
        if (!this.witService) {
            this.witService = new WitService(this.getSessionService(), this.getSenderService(), this.getPropertiesService().get('wit.ai.access.token'));
        }
        return this.witService;
    }

    getConversationService() {
        if (!this.conversationService) {
            this.conversationService = new ConversationService(this.getApiEndpoint(), this.getContextService(), this.getBackendStub());
        }
        return this.conversationService;
    }

    getContextService() {
        if (!this.contextService) {
            this.contextService = new ContextService();
        }
        return this.contextService;
    }

    getSessionService() {
        if (!this.sessionService) {
            this.sessionService = new SessionService();
        }
        return this.sessionService;
    }

    getSenderService() {
        if (!this.senderService) {
            this.senderService = new SenderService();
        }
        return this.senderService;
    }

    getPropertiesService() {
        if (!this.propertiesService) {
            this.propertiesService = new PropertiesService();
        }
        return this.propertiesService;
    }

    getApiAiWebhook() {
        if (!this.apiAiWebhook) {
            this.apiAiWebhook = new ApiAiWebhook(this.getWebserver(), this.getBackendStub());
            this.apiAiWebhook.startWebhook();
        }
        return this.apiAiWebhook;
    }

    getBackendStub() {
        if (!this.backendStub) {
            this.backendStub = new BackendStub();
        }
        return this.backendStub;
    }

    getWebserver() {
        if (!this.expressServer) {
            this.expressServer = new ExpressServer();
            this.expressServer.startServer();
        }
        return this.expressServer;
    }
}