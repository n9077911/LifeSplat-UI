import AreaChart from "./charts/areaChart";
import React from "react";
import dateBasedAnnotations from "../model/dateBasedAnnotations";
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
                title: 'Investment Capital',
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

    incomeDataSets.annotations = dateBasedAnnotations(props.report.rawReport)

    incomeDataSets.xAxesFormatCallback = (input) => moment(input).month() === props.dob.getMonth() ? moment(input).year() - props.dob.getFullYear() : ''
    incomeDataSets.yAxesFormatCallback = (input) => formatMoney(input)

    return <div className="d-flex flex-column">
        <div>
            <AreaChart
                data={incomeDataSets}
                title="Income"
                color="#70CAD1"/>
        </div>
        <div style={{'width':'90vw'}}>
            <ul>
                <li className="mt-2 lead">Shows how your total savings change over your life.</li>
                <li className="mt-2 lead">LifeSplat considers your private pension to be part of your savings.</li>
                <ul>
                    <li>Light purple indicates you haven't reached your private pension age. Dark purple indicates you have.</li>
                </ul>
            </ul>
        </div>
    </div>;
}