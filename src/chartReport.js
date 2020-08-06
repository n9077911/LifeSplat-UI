import moment from "moment";
import AreaChart from "./areaChart";
import LineChart from "./lineChart";
import React from "react";

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

    let slice = props.report.steps.slice(50,100);
    
    let incomeDataSets = {
        xAxis: slice.map(x => x[dateIndex]),
        dataSets: [
            {
                title: 'Spending Line',
                color: 'red',
                fill: 'none',
                pointRadius: 2,
                data: slice.map(x => props.report.spending)
            },
            {
                title: 'Salary',
                color: 'OrangeRed',
                data: slice.map((x, i) =>  x[salaryIndex]).filter(i => i > 0)
            },
            {
                title: 'StatePension',
                color: 'LawnGreen',
                data: slice.map(x => x[statePensionIndex] > 0 ? x[statePensionIndex] + x[salaryIndex] : null)
            },
            {
                title: 'Pension Earnings',
                color: 'Purple',
                data: slice
                    .map(x => moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) && x[privatePensionGrowthIndex] > 1 ? x[privatePensionGrowthIndex] + x[salaryIndex] + x[statePensionIndex] : null)
            },
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: slice.filter(i => i[growthIndex] > 0).map(x => x[growthIndex] + x[privatePensionGrowthIndex] + x[salaryIndex] + x[statePensionIndex])
            },
            {
                title: 'Spending Savings',
                color: 'orange',
                fill: 'origin',
                data: slice.map(x => x[statePensionIndex] + x[privatePensionGrowthIndex] + x[growthIndex] + x[salaryIndex] > props.report.spending ? null : props.report.spending)
            },
        ]
    }

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