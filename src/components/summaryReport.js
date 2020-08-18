import moment from "moment";
import React from "react";
import {formatMoney} from "../helpers";

export default function SummaryReport(props) {

    function getRetirementAgeSummary() {
        return props.report.targetRetirementAge
            ? <div>You plan to retire age &nbsp;<span
                className="text-big text-success">{props.report.targetRetirementAge}</span>, but you could retire at age &nbsp;<span
                className="text-big text-success">{props.report.minimumPossibleRetirementAge}</span></div>
            
            : <div>You can retire {moment(props.report.minimumPossibleRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                className="text-big text-success">{props.report.minimumPossibleRetirementAge}</span></div>;
    }

    return <ul>
        <li className="mt-2">{getRetirementAgeSummary()}</li>
        <li className="mt-2">Your state pension starts {moment(props.report.person[0].stateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
            className="text-big text-success">{props.report.person[0].stateRetirementAge}</span></li>
        <li className="mt-2">Your estimated state pension would be &nbsp;<span className="text-big text-success">{formatMoney(props.report.person[0].annualStatePension)}</span> per annum</li>
        <li className="mt-2">Your private pension starts {moment(props.report.person[0].privateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
            className="text-big text-success">{props.report.person[0].privateRetirementAge}</span></li>
        <li className="mt-2">Your private pension pot might be &nbsp;<span className="text-big text-success">{formatMoney(props.report.person[0].privatePensionPot)}</span>, which gives an annual income
            of &nbsp;<span className="text-big text-success">{formatMoney(props.report.person[0].privatePensionSafeWithdrawal)}</span></li>
        <li className="mt-2">Your total savings at private retirement age are &nbsp;<span
            className="text-big text-success">{formatMoney(props.report.privatePensionPotAtPrivatePensionAge + props.report.savingsAtPrivatePensionAge)}</span></li>
        <li className="mt-2">Your total savings at state retirement age are &nbsp;<span
            className="text-big text-success">{formatMoney(props.report.privatePensionPotAtStatePensionAge + props.report.savingsAtStatePensionAge)}</span></li>
        <li className="mt-2">Your current take home salary is &nbsp;<span className="text-big text-success">{formatMoney(props.report.person[0].afterTaxSalary)}</span></li>
        <li className="mt-2">You currently pay <span className="text-big text-danger">{formatMoney(props.report.person[0].nationalInsuranceBill + props.report.person[0].incomeTaxBill)}</span> of tax <small>(Income
            Tax: <span
                className="text-danger">{formatMoney(props.report.person[0].incomeTaxBill)}</span>, National Insurance: <span
                className="text-danger">{formatMoney(props.report.person[0].nationalInsuranceBill)}</span></small>)
        </li>
    </ul>;
}


