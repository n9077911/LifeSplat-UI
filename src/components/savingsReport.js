import AreaChart from "./charts/areaChart";
import React from "react";
import addDateBasedAnnotations from "../dateBasedAnnotations";
import moment from "moment";
import {formatMoney} from "../helpers";

export default function SavingsReport(props) {
    let cashIndex = props.report.stepsHeaders.indexOf('Cash')
    let privatePensionAmountIndex = props.report.stepsHeaders.indexOf('PrivatePensionAmount')
    let dateIndex = props.report.stepsHeaders.indexOf('Date')

    let incomeDataSets = {
        yAxisTitle: 'Total',
        xAxisTitle: 'Age',
        xAxisLabels: props.report.steps.map(x => x[dateIndex]),
        dataSets: [
            {
                title: 'Investments',
                color: 'LightCyan',
                step: false,
                data: props.report.steps.map(x => x[cashIndex] > 0 ? x[cashIndex] : null)
            },
            {
                title: 'Private Pension - Locked away',
                color: 'violet',
                step: false,
                data: props.report.steps
                    .map(x => moment(x[dateIndex]).isSameOrBefore(props.report.privateRetirementDate) && x[privatePensionAmountIndex] > 0 ? x[privatePensionAmountIndex] : null)
            },
            {
                title: 'Private Pension - Active',
                color: 'Purple',
                step: false,
                data: props.report.steps
                    .map(x => moment(x[dateIndex]).isAfter(props.report.privateRetirementDate) && x[privatePensionAmountIndex] > 0 ? x[privatePensionAmountIndex] : null)
            },
        ],
    }

    incomeDataSets.annotations = addDateBasedAnnotations(incomeDataSets.annotations, props.report)

    incomeDataSets.xAxesFormatCallback = (input) => moment(input).month() === props.dob.getMonth() ? moment(input).year() - props.dob.getFullYear() : ''
    incomeDataSets.yAxesFormatCallback = (input) => formatMoney(input)

    return <div className="d-flex flex-column">
        <div>
            <AreaChart
                data={incomeDataSets}
                title="Income"
                color="#70CAD1"/>
        </div>
    </div>;
}