import moment from "moment";
import {formatMoney, last} from "../helpers";
import AreaChart from "./charts/areaChart";
import React from "react";
import addDateBasedAnnotations from "../dateBasedAnnotations";

function IncomeVsSpendingReport(props) {
    let salaryIndex = props.report.stepsHeaders.indexOf('AfterTaxSalary')
    let statePensionIndex = props.report.stepsHeaders.indexOf('StatePension')
    let privatePensionGrowthIndex = props.report.stepsHeaders.indexOf('PrivatePensionGrowth')
    let growthIndex = props.report.stepsHeaders.indexOf('Growth')
    let dateIndex = props.report.stepsHeaders.indexOf('Date')

    // Debug comment, can be used to zoom in
    // let slice = props.report.steps.slice(50,100);
    let slice = props.report.steps;

    let incomeDataSets = {
        yAxisTitle: 'Per Month',
        xAxisTitle: 'Age',
        xAxisLabels: slice.map(x => x[dateIndex]),
        dataSets: [
            {
                title: 'Salary',
                color: 'OrangeRed',
                data: slice.map((x) => x[salaryIndex] > 0 ? x[salaryIndex] : null)
            },
            {
                title: 'State Pension',
                color: 'LawnGreen',
                data: slice.map(x => x[statePensionIndex] > 0 ? x[statePensionIndex] : null)
            },
            {
                title: 'Private Pension',
                color: 'Purple',
                data: slice
                    .map(x => moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) && x[privatePensionGrowthIndex] > 0 ? x[privatePensionGrowthIndex] : null)
            },
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: slice.map(x => x[growthIndex] > 0 ? x[growthIndex] : null)
            },
            {
                title: 'Savings',
                color: 'orange',
                fill: 'origin',
                data: slice.map(x => {
                    let privatePension = moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) ? x[privatePensionGrowthIndex] : 0
                    let spentSavings = props.report.spending - x[statePensionIndex] - privatePension - x[growthIndex] - x[salaryIndex];
                    return spentSavings > 0 && moment(x[dateIndex]).isSameOrBefore(props.report.bankruptDate) ? spentSavings : null;
                })
            },
        ],
        annotations: [
            {axis: "y-axis-0", value: props.report.spending, title: ['You spend', formatMoney(props.report.spending) + ' per month'], color: '#dc3545', position: 'left', xShift: 20, yShift: -10},
        ]
    }

    if (moment(props.report.bankruptDate).year() < 4000)
        incomeDataSets.dataSets.push(
            {
                title: 'Bankrupt!',
                color: 'red',
                fill: 'origin',
                data: slice.map(x => {
                    let privatePension = moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) ? x[privatePensionGrowthIndex] : 0
                    let spentSavings = props.report.spending - x[statePensionIndex] - privatePension - x[growthIndex] - x[salaryIndex]
                    return spentSavings > 0 && moment(x[dateIndex]).isSameOrAfter(props.report.bankruptDate) ? spentSavings : null
                })
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