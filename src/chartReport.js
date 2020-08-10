import moment from "moment";
import AreaChart from "./areaChart";
import LineChart from "./lineChart";
import React from "react";
import {formatMoney, last} from "./helpers";

export default function ChartReport(props) {
    let cashIndex = props.report.stepsHeaders.indexOf('Cash')
    let salaryIndex = props.report.stepsHeaders.indexOf('AfterTaxSalary')
    let statePensionIndex = props.report.stepsHeaders.indexOf('StatePension')
    let privatePensionGrowthIndex = props.report.stepsHeaders.indexOf('PrivatePensionGrowth')
    let privatePensionAmountIndex = props.report.stepsHeaders.indexOf('PrivatePensionAmount')
    let growthIndex = props.report.stepsHeaders.indexOf('Growth')
    let dateIndex = props.report.stepsHeaders.indexOf('Date')
    let savingsDataSet = props.report.steps.map(x => ({time: x[dateIndex], value: x[cashIndex]}))
    let pensionDataSet = props.report.steps.map(x => ({time: x[dateIndex], value: x[privatePensionAmountIndex]}))
    let pensionGrowthDataSet = props.report.steps.map(x => ({time: x[dateIndex], value: x[privatePensionGrowthIndex]}))

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
                    .map(x => moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) && x[privatePensionGrowthIndex] > 1 ? x[privatePensionGrowthIndex] : null)
            },
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: slice.map(x => x[growthIndex] > 0 ? x[growthIndex]: null)
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
            {axis: "y-axis-0", value: props.report.spending, title: ['You spend', formatMoney(props.report.spending) + ' per month'], color: '#dc3545', position: 'left', xShift: 20, yShift: -10 },
            {axis: "x-axis-0", value: props.report.minimumPossibleRetirementDate, title: ['You could retire', moment(props.report.minimumPossibleRetirementDate).format('MMM yy')], yShift: -50},
            {axis: "x-axis-0", value: props.report.privateRetirementDate, title: ['Private Pension', moment(props.report.privateRetirementDate).format('MMM yy')]  , yShift: 0},
            {axis: "x-axis-0", value: props.report.stateRetirementDate, title: ['State Pension', moment(props.report.stateRetirementDate).format('MMM yy')], yShift: 0},
        ]
    }

    if(moment(props.report.bankruptDate).year() < 4000)
        incomeDataSets.dataSets.push(
            {
                title: 'Bankrupt!',
                color: 'red',
                fill: 'origin',
                data: slice.map(x => {
                    let privatePension = moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) ? x[privatePensionGrowthIndex] : 0
                    let spentSavings = props.report.spending - x[statePensionIndex] - privatePension - x[growthIndex] - x[salaryIndex];
                    return spentSavings > 0 && moment(x[dateIndex]).isSameOrAfter(props.report.bankruptDate) ? spentSavings : null;
                })
            }                        
        )    

    if (props.report.targetRetirementAge) {
        incomeDataSets.annotations.push({
            axis: "x-axis-0",
            value: moment(props.report.targetRetirementDate).add(-1, 'months'),
            title: ['Target retirement', moment(props.report.targetRetirementDate).format('MMM yy')],
            yShift: -100
        })
    }
    
    if (moment(props.report.bankruptDate).isBefore(last(props.report.steps)[dateIndex])) {
        incomeDataSets.annotations.push({
            axis: "x-axis-0",
            value: moment(props.report.bankruptDate),
            title: 'Bankrupt!',
            yShift: -150,
            color: '#red'
        })
    }

    incomeDataSets.xAxesFormatCallback = (value) => parseInt(value) - props.dob.getFullYear();
    incomeDataSets.yAxesFormatCallback = (value) => formatMoney(value);

    return <div className="d-flex flex-column">
        <div>
            <AreaChart
                data={incomeDataSets}
                title="Income"
                color="#70CAD1"/>
        </div>
        <div>
            <LineChart
                data={savingsDataSet}
                title="Savings"
                color="#70CAD1"/>
        </div>
        <div>
            <LineChart
                data={pensionDataSet}
                title="Pension Pot"
                color="#70CAD1"/>
        </div>
        <div>
            <LineChart
                data={pensionGrowthDataSet}
                title="Pension Growth"
                color="purple"/>
        </div>
    </div>;
}