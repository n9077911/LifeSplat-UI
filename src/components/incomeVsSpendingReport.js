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

    return <div>
        <AreaChart
            data={incomeDataSets}
            title="Income"
            color="#70CAD1"/>
        <div><h3>Above shows your monthly spending projected over your life.</h3><br/>
            <p>The colours indicate where your income comes from. For example the green at the start of the chart represents your after tax salary.</p>
            <p>Assuming you earn more than you spend you'll have money above the line which is available to be invested.</p>
            <p>Colours stacked on top of each other show that your income can come from many places.</p>
            <p>Where your income falls below your spending the chart assumes you'll make up the difference by dipping into your savings (bright orange)</p>
            <p>If you run out of savings (whoops).. then I'm afriad you're bankrupt and the chart will show that.</p>
        </div>
    </div>;
}

export default React.memo(IncomeVsSpendingReport)

