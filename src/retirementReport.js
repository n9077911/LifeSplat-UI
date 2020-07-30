import React from "react";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import moment from "moment";
import LineChart from "./lineChart";
import AreaChart from "./areaChart";

export default function RetirementReport(props) {
    let cashIndex = props.report.stepsHeaders.indexOf('Cash')
    let salaryIndex = props.report.stepsHeaders.indexOf('AfterTaxSalary')
    let statePensionIndex = props.report.stepsHeaders.indexOf('StatePension')
    let growthIndex = props.report.stepsHeaders.indexOf('Growth')
    let dateIndex = props.report.stepsHeaders.indexOf('Date')

    let savings = props.report.steps.map(x => ({time: x[dateIndex], value: x[cashIndex]}))

    let incomeDataSets = {
        xAxis: props.report.steps.map(x => x[dateIndex]),
        dataSets: [
            {
                title: 'Spending Line',
                color: 'red',
                fill: 'none',
                pointRadius: 2,
                data: props.report.steps.map(x => 1666)
            },
            {
                title: 'Salary',
                color: 'OrangeRed',
                data: props.report.steps.map(x => x[salaryIndex]).filter(i => i > 0)
            },
            {
                title: 'StatePension',
                color: 'LawnGreen',
                data: props.report.steps.map(x => x[statePensionIndex] > 0 ? x[statePensionIndex] + x[salaryIndex] : null)
            },
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: props.report.steps.filter(i => i[growthIndex] > 0).map(x => x[growthIndex] + x[salaryIndex] + x[statePensionIndex])
            },
            {
                title: 'Spending Savings',
                color: 'orange',
                fill: 'origin',
                data: props.report.steps.map(x => x[statePensionIndex] + x[growthIndex] + x[salaryIndex] > 1666 ? null : 1666)
            },
        ]
    }

    return (
        <div>
            <Tabs defaultActiveKey="highLevel">
                <Tab eventKey="highLevel" title="Summary">
                    <ul>
                        <li className="mt-2">You can retire in {moment(props.report.retirementDate).format("MMM YYYY")} at age &nbsp;<span className="text-success">{props.report.retirementAge}</span></li>
                        <li className="mt-2">Your state pension starts in {moment(props.report.stateRetirementDate).format("MMM YYYY")} at age &nbsp;<span className="text-success">{props.report.stateRetirementAge}</span></li>
                        <li className="mt-2">Your after tax salary is &nbsp;<span className="text-success">£30,000</span></li>
                        <li className="mt-2">Your estimated state pension is &nbsp;<span className="text-success">£5400</span></li>
                    </ul>
                </Tab>
                <Tab eventKey="detail" title="Report">
                    <div className="d-flex flex-column">
                        <div>
                            <AreaChart
                                data={incomeDataSets}
                                title="Income"
                                color="#70CAD1"/>
                        </div>
                        <div>
                            <LineChart
                                data={savings}
                                title="Savings"
                                color="#70CAD1"/>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

