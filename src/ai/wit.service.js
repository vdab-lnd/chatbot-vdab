const {Wit, log} = require('node-wit');
const senderRepository = require('../storage/sender.repository');
const sessionRepository = require('../storage/session.repository');
const propertiesService = require('../storage/properties.service');

class WitService {
    constructor(Wit, sessionRepository, senderService, propertiesService) {
        this.Wit = Wit;
        this.userRepository = sessionRepository;
        this.senderRepository = senderService;
        this.propertiesService = propertiesService;
        this.witClient = {};
    }

    $onInit() {
        this.witClient = new this.Wit({
            accessToken: this.propertiesService.get('wit.ai.access.token'),
            actions: {
                send: this.send.bind(this),
                getForecast: this.getForecast.bind(this),
                getShopLocation: this.getShopLocation.bind(this)
            }
        });
    }

    handleInteractive(message, sessionId, sender) {
        this.senderService.addSender(sessionId, sender);
        this.witClient.runActions(sessionId, message, this.contextService.getSession(sessionId))
            .then((context) => {
                this.contextService.setContext(context);
                this.senderService.removeSender(sessionId);
            })
            .catch(console.error);
    }

    send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        console.log('sending from wit...', JSON.stringify(response.text));
        this.senderService.sendMessage(sessionId, response.text);
        return Promise.resolve();
    }

    getForecast({context, entities}) {
        let location = WitService.firstEntityValue(entities, 'location');
        if (location) {
            context.forecast = 'sunny in ' + location; // we should call a weather API here
            delete context.missingLocation;
        } else {
            context.missingLocation = true;
            delete context.forecast;
        }
        return Promise.resolve(context);
    }

    getShopLocation({context, entities}) {
        context.location = WitService.firstEntityValue(entities, 'shop') + 'vile';
        return Promise.resolve(context);
    }

    static firstEntityValue(entities, entity) {
        const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value;
        if (!val) {
            return null;
        }
        return typeof val === 'object' ? val.value : val;
    }
}

const witService = new WitService(Wit, sessionRepository, senderRepository, propertiesService);
witService.$onInit();
module.exports = witService;
