import React, {useCallback, useRef, useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";
import update from 'immutability-helper';

export default function RetirementCalculator() {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [personErrors, setPersonErrors] = useState([{},{}])
    const [spending, setSpending] = useState(20_000)
    const [targetRetirementAge, setTargetRetirementAge] = useState('')
    const [persons, setPersons] = useState([{salary: "50000", savings: "50000", pension: "50000", employerContribution: "3", employeeContribution: "5", female: false, dob: new Date(1981, 4, 1)},
        {salary: "50000", savings: "50000", pension: "50000", employerContribution: "3", employeeContribution: "5", female: false, dob: new Date(1981, 4, 1)}])

    const url = "https://localhost:5001/api/Retirement/Report"
    // const url = "https://sctaxcalcservice.azurewebsites.net/api/Retirement/Report"

    const submittedDob = useRef(persons[0].dob);

    function requestBody(persons, spending, targetRetirementAge) {
        persons = persons.map((p) => {
            return {
                spending: spending / persons.length,
                salary: parseInt(p.salary),
                savings: parseInt(p.savings),
                pension: parseInt(p.pension),
                employerContribution: parseInt(p.employerContribution),
                employeeContribution: parseInt(p.employeeContribution),
                female: p.female,
                dob: p.dob}
        })

        return {
            targetRetirementAge: targetRetirementAge === '' ? 0 : parseInt(targetRetirementAge),
            persons: persons
        }
    }

    const loadReportFromServer = useCallback(() => {
        fetch(url, {
            method: 'POST',
            accept: 'application/json',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(requestBody(persons, parseInt(spending), targetRetirementAge))
        })
            .then((resp) => {
                return resp.json()
            })
            .then((data) => {
                submittedDob.current = persons[0].dob;
                setData(data)
            })
            .catch(reason => {
                    setData({error: reason.toString()})
                }
            )
    }, [spending, targetRetirementAge, persons])

    function handleSubmit(event) {
        loadReportFromServer();
        event.preventDefault();
    }

    function handleSpendingChange(event) {
        setErrorForNumber(event, 'spending')
        setSpending(event.target.value);
    }

    function handleTargetRetirementAgeChange(event) {
        if (event.target.value && (!event.target.value.match(/^\d+$/) || parseInt(event.target.value) > 100))
            setErrors(update(errors, {targetRetirementAge: {$set: "Must be a number below 100"}}))
        else
            setErrors(update(errors, {targetRetirementAge: {$set: ""}}))
        setTargetRetirementAge(event.target.value);
    }

    let handleSalaryChange = (personIndex) => (event) => handleNumberChange(event, personIndex, 'salary')
    let handleSavingsChange = (personIndex) => (event) => handleNumberChange(event, personIndex, 'savings')
    let handlePensionChange = (personIndex) => (event) => handleNumberChange(event, personIndex, 'pension')
    let handleEmployerContributionChange = (personIndex) => (event) => handleNumberChange(event, personIndex, 'employerContribution')
    let handleEmployeeContributionChange = (personIndex) => (event) => handleNumberChange(event, personIndex, 'employeeContribution')
    let onChangeMaleFemale = (personIndex) => (event) => setPersons(update(persons, {[personIndex]: {female: {$set: event.target.value === "true"}}}))
    let handleDob = (personIndex) => (dob) => setPersons(update(persons, {[personIndex]: {dob: {$set: dob}}}))

    function setPersonErrorForNumber(event, personIndex, fieldName) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: "Not a number"}}}))
        else
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: ""}}}))
    }
    
    function setErrorForNumber(event, fieldName) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setErrors(update(errors, {[fieldName]: {$set: "Not a number"}}))
        else
            setErrors(update(errors, {[fieldName]: {$set: ""}}))
    }

    function handleNumberChange(event, personIndex, fieldName) {
        setPersonErrorForNumber(event, personIndex, fieldName);
        let updatedPerson = update(persons, {[personIndex]: {[fieldName]: {$set: event.target.value}}});
        setPersons(updatedPerson);
    }

    function personChangeHandlers(index) {
        return {
            salary: handleSalaryChange(index),
            savings: handleSavingsChange(index),
            pension: handlePensionChange(index),
            employerContribution: handleEmployerContributionChange(index),
            employeeContribution: handleEmployeeContributionChange(index),
            maleFemale: onChangeMaleFemale(index),
            dob: handleDob(index)
        }
    }

    return (
        <div id="formAndResults" className="row d-flex flex-column">
            <div id="form">
                <form onSubmit={handleSubmit} className="salaryForm ml-1 ml-md-3">
                    <div className='' style={{width: '95vw'}}>
                        <div id="formComponents" className="d-flex-column flex-wrap">
                            <div className="d-flex">
                                <FormInputMoney error={errors.spending} handleChange={handleSpendingChange} value={spending} placeHolder={'spending'}>
                                    Annual Spending
                                </FormInputMoney>
                                <FormInput error={errors.targetRetirementAge} handleChange={handleTargetRetirementAgeChange} value={targetRetirementAge} placeHolder={'optional'}
                                           errorMessage={'Must be between 18 and 100'} inputClass="input-control-age">
                                    Target Retirement Age:
                                </FormInput>
                            </div>
                            <PersonFormSection changeHandlers={personChangeHandlers(0)} person={persons[0]} errors={personErrors} index={0}/>
                            {persons.length > 1 ? <PersonFormSection changeHandlers={personChangeHandlers(1)} person={persons[1]} errors={personErrors} index={1} /> : ''}
                        </div>
                        <div>
                            <input className="btn btn-primary" disabled={errors.salary} type="submit"
                                   value="Submit"/>
                        </div>
                    </div>
                </form>
            </div>
            <div id="results" className="w-auto mt-3 mt-md-1 ml-1 md-ml-3">
                {data.minimumPossibleRetirementAge ? <TabbedRetirementReport report={data} dob={submittedDob.current}/> : ''}
                {data.error ? data.error : ''}
            </div>
        </div>
    );
}

function PersonFormSection(props) {
    return <div id={"person"+props.index}>
        <div className="d-flex flex-wrap">
            <FormInputMoney error={props.errors[props.index].salary} handleChange={props.changeHandlers.salary} value={props.person.salary} placeHolder={'salary'}>
                Annual Salary
            </FormInputMoney>
            <FormInputMoney error={props.errors[props.index].savings} handleChange={props.changeHandlers.savings} value={props.person.savings} placeHolder={'savings'}>
                Savings
            </FormInputMoney>
            <FormInputMoney error={props.errors[props.index].pension} handleChange={props.changeHandlers.pension} value={props.person.pension} placeHolder={'pension'}>
                Existing Pension
            </FormInputMoney>
            <FormInputPercent error={props.errors[props.index].employerContribution} handleChange={props.changeHandlers.employerContribution} value={props.person.employerContribution}>
                Employer Contribution
            </FormInputPercent>
            <FormInputPercent error={props.errors[props.index].employeeContribution} handleChange={props.changeHandlers.employeeContribution} value={props.person.employeeContribution}>
                Employee Contribution
            </FormInputPercent>
            <div className="form-group">
                <FormGroupLabel>DOB:</FormGroupLabel>
                <div className="mr-1"><DatePicker
                    selected={props.person.dob}
                    onChange={props.changeHandlers.dob}
                    showYearDropdown
                    showMonthDropdown
                    dateFormat="dd/MM/yyyy"/>
                </div>
            </div>
            <FormGenderRadio onChange={props.changeHandlers.maleFemale} index={props.index}/>
        </div>
    </div>
}

function FormGroupLabel(props) {
    return <div className="no-wrap"><small>{props.children}</small></div>
}


function FormInputPercent(props) {
    let error = 'Must be a single digit.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error} append={'%'}
                      inputClass="input-control-percent">
        {props.children}
    </FormInput>
}

function FormInputMoney(props) {
    let error = 'Must be a positive number without punctuation.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error} prepend={'£'}
                      inputClass="input-control-money">
        {props.children}
    </FormInput>
}

function FormInput(props) {
    return <div className={'form-group input-control-group mr-2 '}>
        <FormGroupLabel>{props.children}</FormGroupLabel>
        <div className={'input-group ' + props.inputClass}>
            {props.prepend 
                ? <div className="input-group-prepend">
                    <span className="input-group-prepend input-group-text">{props.prepend}</span>
                </div>
                : ''}
            <input type="text" placeholder={props.placeHolder}
                   className={"form-control " + (props.error ? "is-invalid" : "")}
                   onChange={props.handleChange}
                   value={props.value}/>
            {props.append
                ? <div className="input-group-append">
                    <span className="input-group-text">{props.append}</span>
                </div>
                : ''}
        </div>
        <div className="text-danger text-wrap" hidden={!props.error}>
            <small>{props.errorMessage}</small>
        </div>
    </div>;
}


function FormGenderRadio(props) {
    return <div className="mr-1 mt-3">
        <fieldset className="form-group" onChange={props.onChange}>
            <div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input type="radio" className="form-check-input" name={"maleFemaleRadios"+props.index}
                               id={"maleRadios"+props.index} value="false" defaultChecked={true}/>
                        Male
                    </label>
                </div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input type="radio" className="form-check-input" name={"maleFemaleRadios"+props.index}
                               id={"femaleRadios"+props.index} value="true"/>
                        Female
                    </label>
                </div>
            </div>
        </fieldset>
    </div>
}