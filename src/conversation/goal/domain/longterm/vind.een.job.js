import HasLocationGoal from '../shortterm/has.location.goal';
import HasKeywordGoal from '../shortterm/has.keyword.goal';
import applicationConfig from '../../../../applicationConfig';
import BackendService from '../../../../backend/backend.service';
import FilterGoal from '../shortterm/has.filter.goal';
import GoalFactory from '../../goal.factory';

export default class VindEenJobGoal {

    constructor(data, {filter}) {
        this.shorttermGoals = [
            new HasLocationGoal(data),
            new HasKeywordGoal(data),
            new FilterGoal(data, filter)
        ];

        data.vindEenJob = data.vindEenJob ? data.vindEenJob : {filters: {}};
        data.vindEenJob.clearData = !filter;
        if(data.vindEenJob.clearData) {
            data.vindEenJob.location= null;
            data.vindEenJob.keyword = null;
            data.vindEenJob.filters = {};
        }

        this.vindEenJobClient = applicationConfig.getVindEenJobClient();
        this.filterService = applicationConfig.getFilterService();
        this.name = 'VindEenJob';
    }

    startData({vindEenJob}, userAction) {
        if (vindEenJob.clearData) {

            let {location, company, profession} = userAction.entities;
            if (location) {
                vindEenJob.location = location;
            }

            if (company) {
                vindEenJob.keyword = company;
            }

            if (profession) {
                vindEenJob.keyword = profession;
            }
        }
    }

    completeData({vindEenJob}) {
        this.promise = this.vindEenJobClient.lookupJobs({
            keyword: vindEenJob.keyword,
            location: vindEenJob.location,
            filters: vindEenJob.filters,
            limit: '5'
        });
    }

    getShorttermGoals() {
        return this.shorttermGoals;
    }

    start(speech, {vindEenJob}) {
        if (!vindEenJob.location && !vindEenJob.keyword) {
            speech.addMessage('Laten we een job voor je zoeken!');
            speech.send();
        }
    }

    complete(speech) {
        this.promise.then((jobs) => {
            if (jobs.length !== 0) {
                speech.addElements(BackendService.mapToElements(jobs));
                speech.addDelay(3000);
                speech.addQuickReplies('Wil je je zoekresultaat verfijnen?',
                    [{
                        value: 'Ja',
                        label: 'ja'
                    }, {
                        value: 'Nee',
                        label: 'nee'
                    }]);
                speech.send();
            } else {
                speech.addMessage('Sorry, ik kan geen resultaten voor deze criteria vinden...');
                speech.send();
            }
        });
    }

    completeGoal(goal, data) {
        goal.mainGoal = GoalFactory.newMainGoal('filter', data);
        goal.shorttermGoal = GoalFactory.newShortTermGoal('acceptNext', data);
    }
}
