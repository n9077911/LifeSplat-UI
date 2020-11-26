import React, {useCallback, useRef, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";
import UserInputForm, {addEmptyPersonError} from "./userInputForm";

export default function MainPage() {
    let spendingDefault, salary, savings, pension, emergencyFund = ''
    let url = process.env.REACT_APP_SERVICE_URL;

    if (process.env.REACT_APP_ENV === 'dev') {
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
        persons: [{
            salary: salary, savings: savings, pension: pension, employerContribution: "3", employeeContribution: "5", female: false, dob: new Date(1981, 4, 1),
            rental: [], children: [], salarySteps: []
        }]
    })
    const [errors, setErrors] = useState({spending: '', targetRetirementAge: '', targetCashSavings: '', spendingSteps: [], persons: [{rental: [], salarySteps: []}]})

    const submittedDob = useRef(formState.persons[0].dob);
    const fullyCalcd = useRef(true);
    const populatedByUrl = useRef(false);

    const loadReportFromServer = useCallback(() => {
        let body = JSON.stringify(formState);
        fetch(url + '?criteria=' + body)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                fullyCalcd.current = true;
                submittedDob.current = formState.persons[0].dob;
                setResult(data)
                window.history.replaceState(null, null, window.location.origin + `?criteria=${body}`)
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

    function populateFormFromUrl() {
        function setEmpty(errorsCopy) {
            errorsCopy.spending = ''
            errorsCopy.targetRetirementAge = ''
            errorsCopy.emergencyFund = ''
            errorsCopy.targetCashSavings = ''
            errorsCopy.spendingSteps = errorsCopy.spendingSteps.map(spendingStep => ({amount: '', age: ''}))
            
            errorsCopy.persons = errorsCopy.persons.map(person =>(
                {
                    salary: '', savings: '', pension: '', employeeContribution: '', employerContribution: '', 
                    rental: person.rental.map(rental => ({grossRent: '', mortgageCosts: '', expenses: ''})),
                    salarySteps: person.salarySteps.map(salaryStep => ({amount: '', age: ''}))
                }));
            
            return errorsCopy
        }

        if (!reportHasRan()) {
            let text = window.location.search;
            if (text.startsWith('?criteria=') && !populatedByUrl.current) {

                text = text.replaceAll('%22', '"')
                text = text.slice(10)
                let state = JSON.parse(text, dateReviver)
                setFormState(state)

                let errorsCopy = {...state}
                errorsCopy = setEmpty(errorsCopy);

                setErrors(errorsCopy)
                
                populatedByUrl.current = true
            }
        }
    }
    
    populateFormFromUrl();

    let formContext = {errors: errors, setErrors: setErrors, formState: formState, setFormState: setFormState, setFormStale: setFormStale}

    return (
        <div id="formAndResults" className="row d-flex flex-column">
            <div className={"mx-1 mx-md-3"}>{!reportHasRan() ? <InitialExplainer/> : ''}</div>

            <UserInputForm formContext={formContext} formSubmit={handleSubmit} fullyCalcd={fullyCalcd.current}/>

            <TabbedRetirementReport rawReport={result} dob={submittedDob.current}/>
        </div>
    );
}

function InitialExplainer() {
    return <div className={"alert alert-primary initial-explainer"}>
        <h2>Welcome!</h2><h4>Enter your details to calculate your earliest feasible retirement date.</h4>
    </div>
}

//Taken from https://stackoverflow.com/questions/15120256/json-parse-or-alternative-library-that-will-also-parse-dates/15120418#15120418
//Required to round trip dates through JSON.Stringify and JSON.Parse
function dateReviver(key, value) {
    let a;
    if (typeof value === 'string') {
        a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
        if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                +a[5], +a[6]));
        }
    }
    return value;
}