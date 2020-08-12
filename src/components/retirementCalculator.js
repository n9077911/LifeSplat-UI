import React, {useCallback, useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";
import update from 'immutability-helper';

export default function RetirementCalculator() {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [spending, setSpending] = useState(20_000)
    const [targetRetirementAge, setTargetRetirementAge] = useState('')
    const [person, setPerson] = useState({salary: 100_000, savings: 10_000, pension: 10_000, employerContribution: 3, employeeContribution: 5, female: false, dob: new Date(1981, 4, 1)})

    // const url  = "https://localhost:5001/api/Retirement/Report"
    const url = "https://sctaxcalcservice.azurewebsites.net/api/Retirement/Report"
    // api/Retirement/Report?salary=100000&spending=40000&dob=1981-05-30&female=false&savings=20000&existingPension=20000&employerContribution=3&employerContribution=5

    let submittedDob = person.dob;

    const loadReportFromServer = useCallback(() => {
        fetch(url + '?salary=' + (person.salary || 0) + '&spending=' + spending
            + '&dob=' + person.dob.toISOString() + '&female=' + person.female + "&existingSavings=" + (person.savings || 0)
            + "&existingPension=" + (person.pension || 0) + "&employerContribution=" + (person.employerContribution || 0)
            + "&employeeContribution=" + (person.employeeContribution || 0) + (targetRetirementAge && "&targetRetirementAge=" + targetRetirementAge))
            .then((resp) => resp.json())
            .then((data) => {
                // submittedDob = person.dob;
                setData(data)
            })
            .catch(reason => {
                    setData({error: reason.toString()})
                }
            )
    }, [spending, targetRetirementAge, person])

    function handleSubmit(event) {
        loadReportFromServer();
        event.preventDefault();
    }

    function handleSpendingChange(event) {
        setErrorForMoney(event, 'spending')
        setSpending(event.target.value);
    }
    function handleTargetRetirementAgeChange(event) {
        if (event.target.value && parseInt(event.target.value) > 100)
            setErrors(update(errors, {targetRetirementAge: {$set: "Not a number"}}))
        else
            setErrors(update(errors, {targetRetirementAge: {$set: ""}}))
        setTargetRetirementAge(event.target.value);
    }
    
    let handleSalaryChange = (event) => handleMoneyChange(event, 'salary')
    let handleSavingsChange = (event) => handleMoneyChange(event, 'savings')
    let handlePensionChange = (event) => handleMoneyChange(event, 'pension')
    let handleEmployerContributionChange = (event) => setPerson(update(person, {employerContribution: {$set: event.target.value}}))
    let handleEmployeeContributionChange = (event) => setPerson(update(person, {employeeContribution: {$set: event.target.value}}))
    let onChangeMaleFemale = (event) => setPerson(update(person, {female: {$set: event.target.value === "true"}}))
    let handleDateChange = (dob) => setPerson(update(person, {dob: {$set: dob}}))

    function setErrorForMoney(event, fieldName) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setErrors(update(errors, {[fieldName]: {$set: "Not a number"}}))
        else
            setErrors(update(errors, {[fieldName]: {$set: ""}}))
    }

    function handleMoneyChange(event, fieldName) {
        setErrorForMoney(event, fieldName);
        setPerson(update(person, {[fieldName]: {$set: event.target.value}}));
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
                            <div id="person1">
                                <div className="d-flex flex-wrap">
                                    <FormInputMoney error={errors.salary} handleChange={handleSalaryChange} value={person.salary} placeHolder={'salary'}>
                                        Annual Salary
                                    </FormInputMoney>
                                    <FormInputMoney error={errors.savings} handleChange={handleSavingsChange} value={person.savings} placeHolder={'savings'}>
                                        Savings
                                    </FormInputMoney>
                                    <FormInputMoney error={errors.pension} handleChange={handlePensionChange} value={person.pension} placeHolder={'pension'}>
                                        Existing Pension
                                    </FormInputMoney>
                                        <FormInputPercent error={errors.employerContribution} handleChange={handleEmployerContributionChange} value={person.employerContribution}>
                                        Employer Contribution
                                    </FormInputPercent>
                                        <FormInputPercent error={errors.employeeContribution} handleChange={handleEmployeeContributionChange} value={person.employeeContribution}>
                                        Employee Contribution
                                    </FormInputPercent>
                                    <div className="form-group">
                                        <FormGroupLabel>DOB:</FormGroupLabel>
                                        <div className="mr-1"><DatePicker
                                            selected={person.dob}
                                            onChange={handleDateChange}
                                            showYearDropdown
                                            showMonthDropdown
                                            dateFormat="dd/MM/yyyy"/>
                                        </div>
                                    </div>
                                    <FormGenderRadio onChange={onChangeMaleFemale}/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <input className="btn btn-primary" disabled={errors.salary} type="submit"
                                   value="Submit"/>
                        </div>
                    </div>
                </form>
            </div>
            <div id="results" className="w-auto mt-3 mt-md-1 ml-1 md-ml-3">
                {data.minimumPossibleRetirementAge ? <TabbedRetirementReport report={data} dob={submittedDob}/> : ''}
                {data.error ? data.error : ''}
            </div>
        </div>
    );
}

function FormGroupLabel(props) {
    return <div className="no-wrap"><small>{props.children}</small></div>
}


function FormInputPercent(props) {
    let error = 'Must be a single digit.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error} 
                      inputClass="input-control-percent">
        {props.children}
    </FormInput>
}

function FormInputMoney(props) {
    let error = 'Must be a positive number without punctuation.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error}
                      inputClass="input-control-money">
        {props.children}
    </FormInput>
}

function FormInput(props) {
    return <div className="form-group input-control-group mr-1">
        <FormGroupLabel>{props.children}</FormGroupLabel>
        <div>
            <input type="text" placeHolder={props.placeHolder}
                   className={"form-control " + props.inputClass + " " + (props.error ? "is-invalid" : "")}
                   onChange={props.handleChange}
                   value={props.value}/>
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
                        <input type="radio" className="form-check-input" name="maleFemaleRadios"
                               id="maleRadios" value="false" defaultChecked={true}/>
                        Male
                    </label>
                </div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input type="radio" className="form-check-input" name="maleFemaleRadios"
                               id="femaleRadios" value="true"/>
                        Female
                    </label>
                </div>
            </div>
        </fieldset>
    </div>
}