import moment from "moment";
import {formatMoney, last} from "./helpers";
import AreaChart from "./areaChart";
import React from "react";

export default function SavingsReport(props) {
    let cashIndex = props.report.stepsHeaders.indexOf('Cash')
    let privatePensionAmountIndex = props.report.stepsHeaders.indexOf('PrivatePensionAmount')
    let dateIndex = props.report.stepsHeaders.indexOf('Date')

    // Debug comment, can be used to zoom in
    // let slice = props.report.steps.slice(50,100);
    let slice = props.report.steps;

    let incomeDataSets = {
        yAxisTitle: 'Total',
        xAxisTitle: 'Age',
        xAxisLabels: slice.map(x => x[dateIndex]),
        dataSets: [
            {
                title: 'Investment Earnings',
                color: 'LightCyan',
                data: slice.map(x => x[cashIndex] > 0 ? x[cashIndex] : null)
            },
            {
                title: 'Private Pension',
                color: 'Purple',
                data: slice
                    .map(x => x[privatePensionAmountIndex] > 0 ? x[privatePensionAmountIndex] : null)
            },
        ],
    }

    return <div className="d-flex flex-column">
        <div>
            <AreaChart
                data={incomeDataSets}
                title="Income"
                color="#70CAD1"/>
        </div>
    </div>;
}