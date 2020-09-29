import moment from "moment";
import {formatMoney} from "../helpers";
import React from "react";

export default function SummaryReportForCouple(props) {

    function getRetirementAgeSummary(report, person, partner) {
        if (props.report.targetRetirementAge) {
            let canRetireSafely = moment(props.report.targetRetirementDate).isSameOrAfter(person.minimumPossibleRetirementDate);
            if (canRetireSafely) {
                return <div>{You(partner)} plan to retire age &nbsp;
                    <span className="text-big text-success">{report.targetRetirementAge}</span>, but {LowerYou(partner)} could retire at age &nbsp;
                    <span className="text-big text-success">{person.minimumPossibleRetirementAge}</span></div>;
            } else {
                return <div>{You(partner)} plan to retire age &nbsp;
                    <span className="text-big text-danger">{report.targetRetirementAge}</span>, but would go bankrupt {moment(person.bankruptDate).format("MMM YYYY")} age &nbsp;
                    <span className="text-big text-danger">{person.bankruptAge}</span></div>;
            }
        } else {
            if(person.bankruptAge < 100)
                return <div>{You(partner)} will go bankrupt {moment(person.bankruptDate).format("MMM YYYY")} age &nbsp;
                    <span className="text-big text-danger">{person.bankruptAge}</span></div>
            else
                return <div>{You(partner)} can retire {moment(person.minimumPossibleRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                    className="text-big text-success">{person.minimumPossibleRetirementAge}</span></div>;
        }
    }

    function Your(partner) {
        return <span>{partner ? 'Their ' : 'Your '}</span>;
    }
    
    function You(partner) {
        return <span>{partner ? 'They ' : 'You '}</span>;
    }
    
    function LowerYou(partner) {
        return <span>{partner ? 'they ' : 'you '}</span>;
    }

    function combined(partner) {
        return <span> {partner ? 'combined ' : ''}</span>;
    }

    function getPersonReport(report, person, partner) {
        return <ul style={{"minWidth": "400px"}}>
            <li className="mt-2">{getRetirementAgeSummary(report, person, partner)}</li>
            <li className="mt-2">{Your(partner)} state pension starts {moment(person.stateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                className="text-big text-success">{person.stateRetirementAge}</span></li>
            <li className="mt-2">{Your(partner)} estimated state pension would be &nbsp;<span className="text-big text-success">{formatMoney(person.annualStatePension)}</span> per annum - based
                on {person.calculatedNiContributingYears} contributing years
            </li>
            <li className="mt-2">{Your(partner)} private pension starts {moment(person.privateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                className="text-big text-success">{person.privateRetirementAge}</span></li>
            <li className="mt-2">{Your(partner)} private pension pot might be &nbsp;<span className="text-big text-success">{formatMoney(person.privatePensionPot)}</span>, which gives an annual
                income of &nbsp;<span className="text-big text-success">{formatMoney(person.privatePensionSafeWithdrawal)}</span></li>
            <li className="mt-2">Your {combined(partner)}total savings at private retirement age are &nbsp;<span
                className="text-big text-success">{formatMoney(person.privatePensionPotCombinedAtPrivatePensionAge + person.savingsCombinedAtPrivatePensionAge)}</span></li>
            <li className="mt-2">Your {combined(partner)}total savings at state retirement age are &nbsp;<span
                className="text-big text-success">{formatMoney(person.privatePensionPotCombinedAtStatePensionAge + person.savingsCombinedAtStatePensionAge)}</span></li>
            <li className="mt-2">{Your(partner)} current take home salary is &nbsp;<span className="text-big text-success">{formatMoney(person.afterTaxSalary)}</span></li>
            <li className="mt-2">{You(partner)} currently pay <span className="text-big text-danger">{formatMoney(person.nationalInsuranceBill + person.incomeTaxBill)}</span> of tax <small>(Income
                Tax: <span
                    className="text-danger">{formatMoney(person.incomeTaxBill)}</span>, National Insurance: <span
                    className="text-danger">{formatMoney(person.nationalInsuranceBill)}</span></small>)
            </li>
        </ul>;
    }

    return <div className="d-flex column mt-2">
        <div>
            {props.report.person[1] && <h3>You...</h3>}
            {getPersonReport(props.report, props.report.person[0], false)}</div>
            {props.report.person[1] && <div><h3>Your partner... </h3>{getPersonReport(props.report, props.report.person[1], true)}</div>}
    </div>
}