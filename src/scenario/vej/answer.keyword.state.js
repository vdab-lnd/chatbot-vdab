import applicationConfig from '../../applicationConfig';
import EndState from '../end.state';
import FilterStartState from '../filter.results/filter.start.state';

export default class AnswerKeywordState {

    constructor() {
        this.backendService = applicationConfig.getBackendService();
        this.schedulingService = applicationConfig.getSchedulingService();
    }

    saveKeyword(reply, {sessionId, keyword, location}) {
        if(location){
            reply.addMessage(`Ik zoek jobs voor ${keyword} in ${location}`);

        } else {
            reply.addMessage(`Ik zoek jobs voor ${keyword}`);
        }
        reply.send();
        this.lookupJobs(reply, {sessionId, keyword, location});
    }

    unsure(reply, {sessionId, location}) {
        if(location){
            reply.addMessage(`Ik zoek jobs in ${location}`);
            reply.send();
            this.lookupJobs(reply, {sessionId, location});
        } else {
            reply.addMessage('Sorry, zonder informatie kan ik geen job voor je vinden');
            reply.send();
        }
    }

    lookupJobs(reply, {sessionId, location, keyword}){
        this.backendService.lookupJobs({sessionId, keyword, location}).then((jobs) => {
            if(jobs.length !== 0){
                reply.addElements(jobs);
                reply.addDelay(3000);
                reply.addQuickReplies('Wil je deze resultaten nog filteren?', ['ja, graag!', 'nee, dank je']);
                reply.send();
                this.schedulingService.stop(sessionId);
            } else {
                reply.addMessage('Sorry, ik kan geen resultaten voor deze criteria vinden...');
                reply.send();
            }
        });
        return new EndState(new FilterStartState());
    }

}
