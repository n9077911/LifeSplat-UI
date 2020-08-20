import moment from "moment";

export default function Report(report) {
    this.rawReport = report
    this.salaryIndex = report.stepsHeaders.indexOf('AfterTaxSalary')
    this.savingsIndex = report.stepsHeaders.indexOf('Cash')
    this.statePensionIndex = report.stepsHeaders.indexOf('StatePension')
    this.privatePensionGrowthIndex = report.stepsHeaders.indexOf('PrivatePensionGrowth')
    this.privatePensionAmountIndex = report.stepsHeaders.indexOf('PrivatePensionAmount')
    this.growthIndex = report.stepsHeaders.indexOf('Growth')
    this.dateIndex = report.stepsHeaders.indexOf('Date')
    this.people = report.person;

    this.savings = (x) => sumForIndex(x)(this.savingsIndex)

    this.salary = (x) => sumForIndex(x)(this.salaryIndex)

    this.statePension = (x) => sumForIndex(x)(this.statePensionIndex)

    this.investmentGrowth = (x) => sumForIndex(x)(this.growthIndex)

    this.privatePensionGrowthToSpend = (x) => {
        let pension = this.people.map(p => {
            let stepDate = moment(p.steps[x][this.dateIndex]);
            if (stepDate.isSameOrAfter(p.privateRetirementDate) && stepDate.isSameOrAfter(p.minimumPossibleRetirementDate)) {
                return p.steps[x][this.privatePensionGrowthIndex]
            } else {
                return 0
            }})
        return sum(pension)}

    this.privatePensionPotLockedAway = (x) => {
        let pension = this.people.map(p => {
            let stepDate = moment(p.steps[x][this.dateIndex]);
            if (stepDate.isBefore(p.privateRetirementDate) || stepDate.isBefore(p.minimumPossibleRetirementDate)) {
                return p.steps[x][this.privatePensionAmountIndex]
            } else {
                return 0
            }})
        return sum(pension)}

    this.privatePensionPotAvailable = (x) => {
        let pension = this.people.map(p => {
            let stepDate = moment(p.steps[x][this.dateIndex]);
            if (stepDate.isSameOrAfter(p.privateRetirementDate) && stepDate.isSameOrAfter(p.minimumPossibleRetirementDate)) {
                return p.steps[x][this.privatePensionAmountIndex]
            } else {
                return 0
            }})
        return sum(pension)}

    this.savingsSpentPreBankrupt = (x) => {
        let spentSavings = this.savingsSpent(x);
        return moment(this.people[0].steps[x][this.dateIndex]).isSameOrBefore(report.bankruptDate) ? spentSavings : 0;
    }

    this.savingsSpentPostBankrupt = (x) => {
        let spent = this.savingsSpent(x);
        return moment(this.people[0].steps[x][this.dateIndex]).isSameOrAfter(report.bankruptDate) ? spent :  0
    }

    this.spending = () => sum(this.people.map(p => p.spending))

    this.savingsSpent = (x) => this.rawReport.monthlySpending - this.statePension(x) - this.privatePensionGrowthToSpend(x) - this.investmentGrowth(x) - this.salary(x);

    this.stepDates = () => this.rawReport.person[0].steps.map(x => x[this.dateIndex])

    let sumForIndex = (x) => (index) => {
        return sum(this.people.map(p => p.steps[x][index]))
    }

    function sum(numbers) {
        let result = 0;
        numbers.forEach((n) => result += n)
        return result;
    }
}
