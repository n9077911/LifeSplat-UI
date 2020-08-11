import moment from "moment";

export default function addDateBasedAnnotations(annotations, report) {
    function wentBankrupt() {
        return moment(report.bankruptDate).year() < 4000;
    }

    let ageBased = true //todo : extract as a user preference
    
    let privatePensionTime = ageBased ? 'age ' + report.privateRetirementAge : moment(report.privateRetirementDate).format('MMM yy') ;
    let minRetirementTime = ageBased ? 'age ' + report.minimumPossibleRetirementAge : moment(report.minimumPossibleRetirementDate).format('MMM yy');
    let statePensionTime = ageBased ? 'age ' + report.stateRetirementAge : moment(report.stateRetirementDate).format('MMM yy');
    let targetRetirementTime = ageBased ? 'age ' + report.targetRetirementAge : moment(report.targetRetirementDate).format('MMM yy');
    
    let newAnnotations = [
        {axis: "x-axis-0", value: report.minimumPossibleRetirementDate, title: [wentBankrupt() ? 'Safe retirement' : 'You could retire', minRetirementTime], yShift: -50},
        {axis: "x-axis-0", value: report.privateRetirementDate, title: ['Private Pension', privatePensionTime], yShift: 0},
        {axis: "x-axis-0", value: report.stateRetirementDate, title: ['State Pension', statePensionTime], yShift: 0}]


    if (report.targetRetirementAge) {
        newAnnotations.push({
            axis: "x-axis-0",
            value: moment(report.targetRetirementDate).add(-1, 'months'),
            title: ['Target retirement', targetRetirementTime],
            yShift: -100
        })
    }


    if (wentBankrupt()) {
        newAnnotations.push({
            axis: "x-axis-0",
            value: moment(report.bankruptDate),
            title: 'Bankrupt!',
            yShift: -150,
            color: 'red'
        })
    }
    
    if(annotations)
        return newAnnotations.concat(annotations)
    return newAnnotations
}