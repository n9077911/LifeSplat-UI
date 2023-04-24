import moment from "moment";
import {formatMoney, formatPercent} from "../helpers";
import React from "react";

export default function SummaryReportForCouple(props) {

    function targetRetirementAfterMinPossible(report, person) {
        return moment(report.targetRetirementDate).isSameOrAfter(person.minimumPossibleRetirementDate);
    }

    function getRetirementAgeSummary(report, person, partner) {
        if (props.report.targetRetirementAge) {
            if (targetRetirementAfterMinPossible(report, person)) {
                return <div>{You(partner)} plan to retire age &nbsp;
                    <span className="text-big text-success">{person.targetRetirementAge}</span>, but {LowerYou(partner)} could retire at age &nbsp;
                    <span className="text-big text-success">{person.minimumPossibleRetirementAge}</span>
                    <ul>
                        <li className="mt-2">{YouCombined(report.person.length > 1)} should have
                            &nbsp;<span className="text-big text-success">{formatMoney(report.savingsCombinedAtTargetRetirementAge + report.privatePensionCombinedAtTargetRetirementAge)}</span>
                            &nbsp;of savings and investments.
                        </li>
                    </ul>
                </div>;
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
                    className="text-big text-success">{person.minimumPossibleRetirementAge}</span>
                    <ul>
                        <li className="mt-2">{YouCombined(report.person.length > 1)} should have
                            &nbsp;<span className="text-big text-success">{formatMoney(report.savingsCombinedAtFinancialIndependenceAge + report.privatePensionCombinedAtFinancialIndependenceAge)}</span>
                            &nbsp;of savings and investments.
                        </li>
                    </ul>
            </div>;
        }
    }

    function Your(partner) {
        return <span>{partner ? 'Their ' : 'Your '}</span>;
    }
    
    function You(partner) {
        return <span>{partner ? 'They ' : 'You '}</span>;
    }
    
    function YouCombined(twoPeople) {
        return <span>{twoPeople ? 'Combined you' : 'You '}</span>;
    }
    
    function LowerYou(partner) {
        return <span>{partner ? 'they ' : 'you '}</span>;
    }

    function combined(partner) {
        return <span> {partner ? 'combined ' : ''}</span>;
    }

    function getPrivatePensionSummary(report, person, partner) {
        return <span>
            {Your(partner)} private pension pot might be &nbsp;<span className="text-big text-success">{formatMoney(person.privatePensionPotBeforeCrystallisation)}</span>
            {person.privateRetirementAge !== person.privateRetirementCrystallisationAge ? <span>&nbsp;<small>(at age {person.privateRetirementCrystallisationAge})</small></span> : ''}
            <ul>
                <li>You can take a tax free lump sum of <span className="text-big text-success">{formatMoney(person.take25LumpSum)}</span></li>
                <li>This leaves a pot of &nbsp;<span className="text-big text-success">{formatMoney(person.privatePensionPotAtCrystallisation)}</span></li>
                <li>Which gives an annual income of &nbsp;<span className="text-big text-success">{formatMoney(person.privatePensionSafeWithdrawal)}</span></li>
            </ul>
        </span>;
    }

    function getPersonReport(report, person, partner) {
        return <ul style={{"minWidth": "400px"}}>
            <li className="mt-2">{getRetirementAgeSummary(report, person, partner)}</li>
            <li className="mt-2">{Your(partner)} state pension starts {moment(person.stateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                className="text-big text-success">{person.stateRetirementAge}</span></li>
            <li className="mt-2">{Your(partner)} estimated state pension would be &nbsp;<span className="text-big text-success">{formatMoney(person.annualStatePension)}</span> per annum - based
                on {person.calculatedNiContributingYears} contributing years
            </li>
            <li className="mt-2">{Your(partner)} private pension becomes available {moment(person.privateRetirementDate).format("MMM YYYY")} at age &nbsp;<span
                className="text-big text-success">{person.privateRetirementAge}</span></li>
            <li className="mt-2">{getPrivatePensionSummary(report, person, partner)}</li>
            
            <li className="mt-2">{Your(partner)} current after tax salary is &nbsp;<span className="text-big text-success">{formatMoney(person.afterTaxSalary+ person.pensionContributions)}</span> per annum</li>
            <ul>
                <li><span className="text-big text-success">{formatMoney(person.afterTaxSalary)}</span> as salary and <span className="text-big text-success">{formatMoney(person.pensionContributions)}</span> as pension contributions. </li>
                <li className="mt-2">{YouCombined(partner)} have a savings rate of &nbsp;<span className="text-big text-success">{formatPercent(report.currentSavingsRate)}</span>
                    &nbsp;&nbsp;<small>(savings / after tax earnings)</small></li>
            </ul>
            {person.takeHomeRentalIncome > 0 ?
                <li className="mt-2">{Your(partner)} current after tax rental income is &nbsp;<span className="text-big text-success">{formatMoney(person.takeHomeRentalIncome)}</span></li>
                : ''}
            <li className="mt-2">{You(partner)} currently pay <span className="text-big text-danger">{formatMoney(person.nationalInsuranceBill + person.incomeTaxBill + person.rentalTaxBill)}</span> of
                tax
                <small>(Income Tax: <span className="text-danger">{formatMoney(person.incomeTaxBill)}</span>
                    {person.rentalTaxBill > 0 ? <span>, Rental Income Tax: <span className="text-danger">{formatMoney(person.rentalTaxBill)}</span></span> : ''}
                    , National Insurance: <span className="text-danger">{formatMoney(person.nationalInsuranceBill)}</span>
                </small>)
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