import moment from "moment";
import {formatMoney, positiveOrNull} from "../helpers";
import AreaChart from "./charts/areaChart";
import React from "react";
import addDateBasedAnnotations from "../dateBasedAnnotations";
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
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: steps.map((x, i) => positiveOrNull(report.investmentGrowth(i)))
            },
            {
                title: 'Savings',
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

    incomeDataSets.annotations = addDateBasedAnnotations(incomeDataSets.annotations, props.report)

    incomeDataSets.annotations.unshift({
            axis: "y-axis-0",
            value: props.report.monthlySpending,
            title: ['You spend', formatMoney(props.report.monthlySpending) + ' per month'],
            color: '#dc3545',
            position: 'left',
            xShift: 20,
            yShift: -10
        }
    )

    incomeDataSets.xAxesFormatCallback = (input) => moment(input).month() === props.dob.getMonth() ? moment(input).year() - props.dob.getFullYear() : ''
    incomeDataSets.yAxesFormatCallback = (input) => formatMoney(input)

    function calcMinimumMessage(report) {
        return report.calcMinimumMode()
            ? <li className="mt-2 lead">Life Splat assumes you'll quit work on the earliest possible date. Add a target retirement age if you plan to continue working.</li>
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
                    <li className="mt-2 lead">Where your income falls below your spending Life Splat assumes you'll make up the difference by dipping into your savings (orange)</li>
                    <li className="mt-2 lead">If your income falls below your spending and you've ran out of savings (whoops).. then I'm afraid you're bankrupt and the chart will show that.</li>
                </ul>
            </div>
        </div>;
}

export default React.memo(IncomeVsSpendingReport)

