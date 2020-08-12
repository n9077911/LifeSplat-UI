import React, {useCallback, useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";

export default function RetirementCalculator() {
    const [data, setData] = useState({})
    const [errors, setErrors] = useState({})
    const [salary, setSalary] = useState(100_000)
    const [savings, setExistingSavings] = useState(10_000)
    const [pension, setExistingPension] = useState(10_000)
    const [employerContribution, setEmployerContribution] = useState(3)
    const [employeeContribution, setEmployeeContribution] = useState(5)
    const [spending, setSpending] = useState(20_000)
    const [targetRetirementAge, setTargetRetirementAge] = useState('')
    const [dob, setDob] = useState(new Date(1981, 4, 1))
    const [female, setFemale] = useState(false)
    // const url  = "https://localhost:5001/api/Retirement/Report"
    const url = "https://sctaxcalcservice.azurewebsites.net/api/Retirement/Report"
    // api/Retirement/Report?salary=100000&spending=40000&dob=1981-05-30&female=false&savings=20000&existingPension=20000&employerContribution=3&employerContribution=5

    let submittedDob = dob

    const loadReportFromServer = useCallback(() => {
        fetch(url + '?salary=' + salary + '&spending=' + spending
            + '&dob=' + dob.toISOString() + '&female=' + female + "&savings=" + savings
            + "&existingPension=" + pension + "&employerContribution=" + employerContribution
            + "&employeeContribution=" + employeeContribution + (targetRetirementAge && "&targetRetirementAge=" + targetRetirementAge))
            .then((resp) => resp.json())
            .then((data) => {
                submittedDob = dob;
                setData(data)
            })
            .catch(reason => {
                    setData({error: reason.toString()})
                }
            )
    }, [salary, spending, dob, female, savings, pension, employerContribution, employeeContribution, targetRetirementAge])

    function handleSubmit(event) {
        loadReportFromServer();
        event.preventDefault();
    }

    function handleSalaryChange(event) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setErrors({salary: "Not a number"})
        else
            setErrors({salary: ""})

        setSalary(event.target.value);
    }

    function handleDateChange(dob) {
        setDob(dob);
    }

    function handleSpendingChange(event) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setErrors({spending: "Not a number"})
        else
            setErrors({spending: ""})

        setSpending(event.target.value);
    }

    function handleSavingsChange(event) {
        setExistingSavings(event.target.value);
    }

    function handlePensionChange(event) {
        setExistingPension(event.target.value);
    }

    function handleEmployerContributionChange(event) {
        setEmployerContribution(event.target.value);
    }

    function handleEmployeeContributionChange(event) {
        setEmployeeContribution(event.target.value);
    }

    function handleTargetRetirementAgeChange(event) {
        setTargetRetirementAge(event.target.value);
    }

    function onChangeMaleFemale(event) {
        setFemale(event.target.value === "true")
    }
    
    return (
        <div id="formAndResults" className="row d-flex flex-column">
            <div id="form">
                <form onSubmit={handleSubmit} className="salaryForm ml-1 ml-md-3">
                    <div className='' style={{width: '95vw'}}>
                        <div id="formComponents" className="d-flex-column flex-wrap">
                            <div className="d-flex">
                                <FormInputMoney error={errors.annualSpending} handleChange={handleSpendingChange} value={spending} placeHolder={'spending'}>
                                Annual Spending
                                </FormInputMoney>
                                <FormInput error={errors.targetRetirementAge} handleChange={handleTargetRetirementAgeChange} value={targetRetirementAge} placeHolder={'optional'}
                                           errorMessage={'Must be between 18 and 100'} inputClass="input-control-age">
                                    Target Retirement Age:
                                </FormInput>
                            </div>
                            <div id="person1">
                                <div className="d-flex flex-wrap">
                                    <FormInputMoney error={errors.annualSalary} handleChange={handleSalaryChange} value={salary} placeHolder={'salary'}>
                                        Annual Salary
                                    </FormInputMoney>
                                        <FormInputMoney error={errors.savings} handleChange={handleSavingsChange} value={savings} placeHolder={'savings'}>
                                        Savings
                                    </FormInputMoney>
                                    <FormInputMoney error={errors.existingPension} handleChange={handlePensionChange} value={pension} placeHolder={'pension'}>
                                        Existing Pension
                                    </FormInputMoney>
                                        <FormInputPercent error={errors.employerContribution} handleChange={handleEmployerContributionChange} value={employerContribution}>
                                        Employer Contribution
                                    </FormInputPercent>
                                        <FormInputPercent error={errors.employeeContribution} handleChange={handleEmployeeContributionChange} value={employeeContribution}>
                                        Employee Contribution
                                    </FormInputPercent>
                                    <div className="form-group">
                                        <FormGroupLabel>DOB:</FormGroupLabel>
                                        <div className="mr-1"><DatePicker
                                            selected={dob}
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
            <small>props.errorMessage</small>
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