export default class WelcomeGoal {

    constructor() {
        this.shorttermGoals = [];
    }

    getShorttermGoals() {
        return this.shorttermGoals;
    }

    start(speech, data) {
        speech.addMessage(`Goeiedag ${data.user.getFullName()}!`);
        speech.send();
    }

    complete(speech) {
        speech.addMessage('Ik ben een chat bot van de VDAB en ik kan je helpen met het vinden van een vacature');
        speech.addMessage('Ik ben nog vrij nieuw dus de kans bestaat dat ik nog fouten maak.');
        speech.addQuickReplies('Zullen we beginnen?', [{label:'Natuurlijk!', value: 'ik zoek een job'}]);
        speech.send();
    }
}