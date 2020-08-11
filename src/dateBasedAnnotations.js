import moment from "moment";

export default function addDateBasedAnnotations(annotations, report) {
    function wentBankrupt() {
        return moment(report.bankruptDate).year() < 4000;
    }

    let ageBased = '' //todo : extract as a user preference

    function message(ageBased, age, date) {
        if(ageBased === 'true')
            return ['Age ' + age]  
        if(ageBased === 'false')
            return [moment(date).format('MMM yy')]
        return ['Age ' + age, moment(date).format('MMM yy')]
    }

    let privatePensionTime = message(ageBased, report.privateRetirementAge, report.privateRetirementDate) ;
    let minRetirementTime = message(ageBased, report.minimumPossibleRetirementAge, report.minimumPossibleRetirementDate) ;
    let statePensionTime = message(ageBased, report.stateRetirementAge, report.stateRetirementDate) ;
    let targetRetirementTime = message(ageBased, report.targetRetirementAge, report.targetRetirementDate) ;
    
    let newAnnotations = [
        {axis: "x-axis-0", value: report.minimumPossibleRetirementDate, title: [wentBankrupt() ? 'Safe retirement' : 'You could retire', ...minRetirementTime], yShift: -50},
        {axis: "x-axis-0", value: report.privateRetirementDate, title: ['Private Pension', ...privatePensionTime], yShift: 0},
        {axis: "x-axis-0", value: report.stateRetirementDate, title: ['State Pension', ...statePensionTime], yShift: 0}]


    if (report.targetRetirementAge) {
        newAnnotations.push({
            axis: "x-axis-0",
            value: moment(report.targetRetirementDate).add(-1, 'months'),
            title: ['Target retirement', ...targetRetirementTime],
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