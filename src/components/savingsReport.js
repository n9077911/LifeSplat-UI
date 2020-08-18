import AreaChart from "./charts/areaChart";
import React from "react";
import addDateBasedAnnotations from "../dateBasedAnnotations";
import moment from "moment";
import {formatMoney, positiveOrNull} from "../helpers";

export default function SavingsReport(props) {

    let stepDates = props.report.stepDates();

    let incomeDataSets = {
        yAxisTitle: 'Total',
        xAxisTitle: 'Age',
        xAxisLabels: stepDates,
        dataSets: [
            {
                title: 'Investments',
                color: 'LightCyan',
                step: false,
                data: stepDates.map((x, i)=> positiveOrNull(props.report.savings(i)))
            },
            {
                title: 'Private Pension - Locked away',
                color: 'violet',
                step: false,
                data: stepDates.map((x, i) => positiveOrNull(props.report.privatePensionPotLockedAway(i)))
            },
            {
                title: 'Private Pension - Active',
                color: 'Purple',
                step: false,
                data: stepDates.map((x, i) => positiveOrNull(props.report.privatePensionPotAvailable(i)))
            },
        ],
    }

    incomeDataSets.annotations = addDateBasedAnnotations(incomeDataSets.annotations, props.report.rawReport)

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