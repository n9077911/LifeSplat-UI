import React, {useCallback, useRef, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";
import moment from "moment";
import UserInputForm from "./userInputForm";
import convertMoneyStringToInt from "../model/convertMoneyStringToInt";

export default function MainPage() {
    let spendingDefault, salary, savings, pension, emergencyFund = ''
    let url = process.env.REACT_APP_SERVICE_URL;

    if(process.env.REACT_APP_ENV === 'dev')
    {
        spendingDefault = process.env.REACT_APP_SPENDING
        salary = process.env.REACT_APP_SALARY
        savings = process.env.REACT_APP_SAVINGS
        pension = process.env.REACT_APP_PENSION
        emergencyFund = process.env.REACT_APP_EMERGENCY_FUND
    }
    
    const [result, setResult] = useState({})
    const [formState, setFormState] = useState({
        spending: spendingDefault, 
        targetRetirementAge: '',
        emergencyFund: emergencyFund, 
        spendingSteps: [], 
        persons: [{salary: salary, savings: savings, pension: pension, employerContribution: "3", employeeContribution: "5", female: false, dob: new Date(1981, 4, 1), 
            rental: []}]
    })
    const [errors, setErrors] = useState({spending: '', targetRetirementAge: '', targetCashSavings: '', spendingSteps: [], persons: [{rental: []}] })

    const submittedDob = useRef(formState.persons[0].dob);
    const fullyCalcd = useRef(true);

    function rentalInfoDto(rental) {
        return {mortgagePayments: convertMoneyStringToInt(rental.mortgageCosts), grossIncome: convertMoneyStringToInt(rental.grossRent), expenses: convertMoneyStringToInt(rental.expenses)}
    }

    function requestBody(persons, spending, spendingSteps, targetRetirementAge, emergencyFund) {
        persons = persons.map((p) => {
            let personDto = {
                salary: convertMoneyStringToInt(p.salary),
                savings: convertMoneyStringToInt(p.savings),
                pension: convertMoneyStringToInt(p.pension),
                employerContribution: parseFloat(p.employerContribution || '0'),
                employeeContribution: parseFloat(p.employeeContribution || '0'),
                female: p.female,
                dob: p.dob,
                rentalInfo: p.rental.map(rentalInfoDto)
            };
            if(typeof(p.niContributingYears) !== 'undefined')
                personDto.niContributingYears = parseInt(p.niContributingYears)
            return personDto
        })

        let steps = spendingSteps.map((x) => ({amount: convertMoneyStringToInt(x.amount), age: parseInt(x.age)}));
        steps.unshift({date: moment().toDate(), amount: convertMoneyStringToInt(spending)});
        
        return {
            targetRetirementAge: targetRetirementAge === '' ? 0 : parseInt(targetRetirementAge),
            emergencyFund: emergencyFund,
            persons: persons,
            spendingSteps: steps,
        }
    }

    const loadReportFromServer = useCallback(() => {
        let body = JSON.stringify(requestBody(formState.persons, formState.spending, formState.spendingSteps, formState.targetRetirementAge, formState.emergencyFund));
        fetch(url, {
            method: 'POST',
            accept: 'application/json',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: body
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                fullyCalcd.current = true;
                submittedDob.current = formState.persons[0].dob;
                setResult(data)
            })
            .catch(reason => {
                    setResult({error: reason.toString()})
                }
            )
    }, [formState, url])

    function handleSubmit() {
        loadReportFromServer();
    }

    function setFormStale() {
        if (result.person)
            fullyCalcd.current = false;
    }

    function reportHasRan() {
        return typeof result.person !== 'undefined'
    }

    let formContext = {errors: errors, setErrors: setErrors, formState: formState, setFormState: setFormState, setFormStale: setFormStale}

    return (
        <div id="formAndResults" className="row d-flex flex-column">
            <div className={"mx-1 mx-md-3"}>{!reportHasRan() ? <InitialExplainer/> : ''}</div>
            
            <UserInputForm formContext={formContext} formSubmit={handleSubmit} fullyCalcd={fullyCalcd.current}/>
            
            <TabbedRetirementReport rawReport={result} dob={submittedDob.current}/>
        </div>
    );
}

function InitialExplainer(){
    return <div className={"alert alert-primary initial-explainer"}>
        <h2>Welcome!</h2><h4>Enter your details to calculate your earliest feasible retirement date.</h4>
    </div>
}