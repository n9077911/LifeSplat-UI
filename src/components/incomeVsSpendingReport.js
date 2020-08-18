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
                color: 'OrangeRed',
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
        annotations: [
            {axis: "y-axis-0", value: props.report.monthlySpending, title: ['You spend', formatMoney(props.report.monthlySpending) + ' per month'], color: '#dc3545', position: 'left', xShift: 20, yShift: -10},
        ]
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

    incomeDataSets.xAxesFormatCallback = (input) => moment(input).month() === props.dob.getMonth() ? moment(input).year() - props.dob.getFullYear() : ''
    incomeDataSets.yAxesFormatCallback = (input) => formatMoney(input)

    return <div>
        <AreaChart
            data={incomeDataSets}
            title="Income"
            color="#70CAD1"/>
    </div>;
}

export default React.memo(IncomeVsSpendingReport)

