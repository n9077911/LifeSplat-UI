import moment from "moment";
import {formatMoney, positiveOrNull} from "../helpers";
import AreaChart from "./charts/areaChart";
import React from "react";
import dateBasedAnnotations from "../model/dateBasedAnnotations";
import Report from "../model/report";

function IncomeVsSpendingReport(props) {

    let steps = props.report.person[0].steps;

    let report = new Report(props.report);

    let incomeDataSets = {
        yAxisTitle: 'Per Month',
        xAxisTitle: 'Age',
        xAxisLabels: steps.map(x => x[report.dateIndex]),
        dataSets: [
            {
                title: 'Salary',
                color: 'Green',
                data: steps.map((x, i) => positiveOrNull(report.salary(i)))
            },
            {
                title: 'State Pension',
                color: 'LawnGreen',
                data: steps.map((x, i) => positiveOrNull(report.statePension(i)))
            },
            {
                title: 'Private Pension',
                color: 'Purple',
                data: steps.map((x, i) => positiveOrNull(report.privatePensionGrowthToSpend(i)))
            },
            {
                title: 'Child Benefit',
                color: 'DarkBlue',
                data: steps.map((x, i) => positiveOrNull(report.childBenefit(i)))
            },
            {
                title: 'Rental Income',
                color: 'LightSeaGreen',
                data: steps.map((x, i) => positiveOrNull(report.rentalIncome(i)))
            },
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: steps.map((x, i) => positiveOrNull(report.investmentGrowth(i)))
            },
            {
                title: 'Investment Capital',
                color: 'orange',
                fill: 'origin',
                data: steps.map((x, i) => positiveOrNull(report.savingsSpentPreBankrupt(i)))
            },
        ],
        annotations: []
    }

    if (moment(props.report.bankruptDate).year() < 4000)
        incomeDataSets.dataSets.push(
            {
                title: 'Bankrupt!',
                color: 'red',
                fill: 'origin',
                data: steps.map((x, i) => positiveOrNull(report.savingsSpentPostBankrupt(i)))
            }
        )

    let dateBasedAnnotation = dateBasedAnnotations(props.report)
    let spendingAnnotations = spendingBasedAnnotations(report)

    incomeDataSets.annotations = spendingAnnotations.concat(dateBasedAnnotation)

    incomeDataSets.xAxesFormatCallback = (input) => moment(input).month() === props.dob.getMonth() ? moment(input).year() - props.dob.getFullYear() : ''
    incomeDataSets.yAxesFormatCallback = (input) => formatMoney(input)

    function calcMinimumMessage(report) {
        return report.calcMinimumMode()
            ? <li className="mt-2 lead">LifeSplat assumes you'll quit work on the earliest possible date. Add a target retirement age if you plan to continue working.</li>
        :  ''
    }

    return <div>
            <div>
            <AreaChart
                data={incomeDataSets}
                title="Income"
                color="#70CAD1"/>
            </div>
            <div style={{'width':'90vw'}}>
                <ul>
                    <li className="mt-2 lead">Shows your monthly income and spending projected over your life.</li>
                    {calcMinimumMessage(report)}
                    <li className="mt-2 lead">The colours indicate where your income comes from. For example the green at the start of the chart represents your monthly after tax salary.</li>
                    <li className="mt-2 lead">Assuming you earn more than you spend you'll have money above the line which is available to be invested.</li>
                    <li className="mt-2 lead">Colours stacked on top of each other show that your income can come from many places.</li>
                    <li className="mt-2 lead">Where your income falls below your spending LifeSplat assumes you'll make up the difference by selling your investments (orange)</li>
                    <li className="mt-2 lead">If your income falls below your spending and you've ran out of savings (whoops).. then I'm afraid you're bankrupt and the chart will show that.</li>
                </ul>
            </div>
        </div>;
}

export default React.memo(IncomeVsSpendingReport)

function spendingBasedAnnotations(report) {
    let spendingSteps = report.spendingSteps();
    let firstStep = spendingSteps.shift();
    let spendingAnnotations = [spendingAnnotation(firstStep, ['You spend', formatMoney(firstStep.spending / 12) + ' per month'])]
    return spendingAnnotations.concat(spendingSteps.map((x) => spendingAnnotation(x, [formatMoney(x.spending / 12), ' per month'])))
}

function spendingAnnotation(spendingStep, title) {
    return {
        axis: "y-axis-0",
        value: spendingStep.spending/12,
        title: title,
        color: '#dc3545',
        position: 'left',
        xShift: 20,
        yShift: -10,
        start: 20,
        xScale: 'x-axis-0',
        xMin: moment(spendingStep.startDate).add(-1, 'months').toDate(),
        xMax: moment(spendingStep.endDate).add(-1, 'months').toDate(),
    }
}