import React, {useCallback, useRef, useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TabbedRetirementReport from "./tabbedRetirementReport";
import update from 'immutability-helper';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import moment from "moment";


// Validators
function getValidAgeError(value) {
    if (value && !value.match(/^\d+$/) || (value.match(/^\d+$/) && parseInt(value) > 100)) {
        return "Must be a number between 18 and 100";
    } else {
        return "";
    }
}

function getErrorForNumber(value) {
    return value && !value.match(/^\d+$/) ? "Not a number" : "";
}

export default function MainPage() {
    let spendingDefault, salary, savings, pension = ""
    let url = process.env.REACT_APP_SERVICE_URL;

    if(process.env.REACT_APP_ENV === 'dev')
    {
        spendingDefault = process.env.REACT_APP_SPENDING
        salary = process.env.REACT_APP_SALARY
        savings = process.env.REACT_APP_SAVINGS
        pension = process.env.REACT_APP_PENSION
    }
    
    const [result, setResult] = useState({})
    const [formState, setFormState] = useState({spending: spendingDefault, targetRetirementAge: '', spendingSteps: []})
    const [errors, setErrors] = useState({spending: '', targetRetirementAge: '', spendingSteps: []})
    const [persons, setPersons] = useState([{salary: salary, savings: savings, pension: pension, employerContribution: "3", employeeContribution: "5", female: false, dob: new Date(1981, 4, 1)}])
    const [personErrors, setPersonErrors] = useState([{}])

    const submittedDob = useRef(persons[0].dob);
    const fullyCalcd = useRef(true);

    function requestBody(persons, spending, spendingSteps, targetRetirementAge) {
        persons = persons.map((p) => {
            let personDto = {
                salary: parseInt(p.salary || '0'),
                savings: parseInt(p.savings || '0'),
                pension: parseInt(p.pension || '0'),
                employerContribution: parseFloat(p.employerContribution || '0'),
                employeeContribution: parseFloat(p.employeeContribution || '0'),
                female: p.female,
                dob: p.dob
            };
            if(typeof(p.niContributingYears) !== 'undefined')
                personDto.niContributingYears = parseInt(p.niContributingYears)
            return personDto
        })

        let steps = spendingSteps.map((x) => ({amount: parseInt(x.amount), age: parseInt(x.age)}));
        steps.unshift({date: moment().toDate(), amount: parseInt(spending || 0)});
        
        return {
            targetRetirementAge: targetRetirementAge === '' ? 0 : parseInt(targetRetirementAge),
            persons: persons,
            spendingSteps: steps,
        }
    }

    function between18and100(age) {
        age = parseInt(age)
        return age >= 18 && age < 100;
    }

    function isAWholeNumber(numberString) {
        return numberString.match(/^\d+$/);
    }

    function validateSpendingSteps(spendingSteps, spendingStepErrors) {
        let errors = spendingSteps.map((s, i)=>{
            let error = spendingStepErrors[i]
            if(!between18and100(s.age)) {
                error.age = true
            }
            if(!isAWholeNumber(s.amount)) {
                error.amount = true
            }
            return error
        });
        return errors;
    }

    function hasSpendingStepErrors(spendingStepErrors) {
        let hasError = false;
        spendingStepErrors.forEach((x)=>{
            if(x.age || x.amount) {
                hasError = true;
            }
        })
             
        return hasError;
    }

    const loadReportFromServer = useCallback(() => {
        let spendingStepsErrors = validateSpendingSteps(formState.spendingSteps, errors.spendingSteps);
        if(hasSpendingStepErrors(errors.spendingSteps)) {
            setErrors(update(errors, {spendingSteps: {$set: spendingStepsErrors}}))
            return;
        }
        
        let body = JSON.stringify(requestBody(persons, parseInt(formState.spending), formState.spendingSteps, formState.targetRetirementAge));
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
                submittedDob.current = persons[0].dob;
                setResult(data)
            })
            .catch(reason => {
                    setResult({error: reason.toString()})
                }
            )
    }, [formState, persons, url, errors, validateSpendingSteps])

    function handleSubmit(event) {
        loadReportFromServer();
        event.preventDefault();
    }

    function setFormStale() {
        if (result.person)
            fullyCalcd.current = false;
    }

    function handleAddSpendingStep(event){
        setFormStale()
        setErrors(update(errors, {spendingSteps: {$push: [{amount: '', age: ''}]}}))
        setFormState(update(formState, {spendingSteps: {$push: [{amount: '', age: ''}]}}))
        
        event.preventDefault();
    }
    
    function handleRemoveSpendingStep(event){
        setFormStale()
        errors.spendingSteps.pop()
        formState.spendingSteps.pop()
        setErrors(update(errors, {spendingSteps: {$set: Array.from(errors.spendingSteps)}}))
        setFormState(update(formState, {spendingSteps: {$set: Array.from(formState.spendingSteps)}}))
        event.preventDefault();
    }
    
    function handleAddRemovePartner(event) {
        if (persons.length === 1) {
            persons.push({dob: persons[0].dob})
            personErrors.push({})
        } else {
            persons.pop()
            personErrors.pop()
        }
        setFormStale();
        setPersons(Array.from(persons))
        setPersonErrors(Array.from(personErrors))
        event.preventDefault();
    }


    let handleSalaryChange = (personIndex) => (event) => handlePersonNumberChange(event, personIndex, 'salary')
    let handleSavingsChange = (personIndex) => (event) => handlePersonNumberChange(event, personIndex, 'savings')
    let handlePensionChange = (personIndex) => (event) => handlePersonNumberChange(event, personIndex, 'pension')
    let handleEmployerContributionChange = (personIndex) => (event) => handleDecimalNumberChange(event, personIndex, 'employerContribution')
    let handleEmployeeContributionChange = (personIndex) => (event) => handleDecimalNumberChange(event, personIndex, 'employeeContribution')
    let handleNiContributingYears = (personIndex) => (event) => handlePersonNumberChange(event, personIndex, 'niContributingYears')
    
    let handleMaleFemale = (personIndex) => (event) => {
        setFormStale()
        return setPersons(update(persons, {[personIndex]: {female: {$set: event.target.value === "true"}}}))
    }
    
    let handleDob = (personIndex) => (dob) => {
        setFormStale()
        return setPersons(update(persons, {[personIndex]: {dob: {$set: dob}}}))
    }
    
    function setPersonErrorForNumber(event, personIndex, fieldName) {
        if (event.target.value && !event.target.value.match(/^\d+$/))
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: "Not a number"}}}))
        else
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: ""}}}))
    }
    
    function setPersonErrorForDecimal(event, personIndex, fieldName) {
        if (event.target.value && !event.target.value.match(/^\d+(\.\d{0,2})?$/))
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: "Not a number"}}}))
        else
            setPersonErrors(update(personErrors, {[personIndex]: {[fieldName]: {$set: ""}}}))
    }

    function handlePersonNumberChange(event, personIndex, fieldName) {
        setFormStale();
        setPersonErrorForNumber(event, personIndex, fieldName);
        let updatedPerson = update(persons, {[personIndex]: {[fieldName]: {$set: event.target.value}}});
        setPersons(updatedPerson);
    }
    

    
    function handleDecimalNumberChange(event, personIndex, fieldName) {
        setFormStale();
        setPersonErrorForDecimal(event, personIndex, fieldName);
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
            maleFemale: handleMaleFemale(index),
            dob: handleDob(index),
            niContributingYears: handleNiContributingYears(index)
        }
    }
    
    function reportHasRan() {
        return typeof result.person !== 'undefined'
    }

    return (
        <div id="formAndResults" className="row d-flex flex-column">
            <div className={"mx-1 mx-md-3"}>{!reportHasRan() ? <InitialExplainer/> : ''}</div>
            <div id="form">
                <form className="salaryForm mx-1 mx-md-3">
                    <div className='' style={{width: '95vw'}}>
                        <div id="formComponents" className="d-flex-column flex-wrap">
                            <div className="centerFlex">
                                <SpendingInput errors={errors} setErrors={setErrors} formState={formState} setFormState={setFormState} setStale={setFormStale}/>
                                <SpendingSteps errors={errors} setErrors={setErrors} formState={formState} setFormState={setFormState} setStale={setFormStale}/>
                                <button className="btn btn-primary mr-2 no-stretch" onClick={handleAddSpendingStep}>
                                    {"Add Spending Step"}
                                </button>
                                {formState.spendingSteps.length > 0 ? <button className="btn btn-primary mr-2 no-stretch" onClick={handleRemoveSpendingStep}>
                                    {"Remove"}
                                </button> : ''}
                                <TargetRetirementAgeInput errors={errors} setErrors={setErrors} formState={formState} setFormState={setFormState} setStale={setFormStale}/>
                            </div>
                            <PersonFormSection changeHandlers={personChangeHandlers(0)} person={persons[0]} errors={personErrors} index={0}/>
                            {persons.length > 1 ?
                                <PersonFormSection changeHandlers={personChangeHandlers(1)} person={persons[1]} errors={personErrors} index={1}/>
                                : ''}
                        </div>
                        <div>
                            <button className="btn btn-primary mr-2" onClick={handleAddRemovePartner}>
                                {persons.length === 2 ? "Remove Partner" : "Add Partner"}
                            </button>
                            <button className={"btn mr-2 " + (fullyCalcd.current ? "btn-success" : "btn-warning")} disabled={errors.salary} onClick={handleSubmit}>
                                Calculate
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div id="results" className="w-auto mt-3 ml-1 ml-md-3">
                {reportHasRan() ? <TabbedRetirementReport report={result} dob={submittedDob.current}/> : ''}
                {result.error ? result.error : ''}
            </div>
        </div>
    );
}
function SpendingInput(props) {
    const spendingPopOver = <div><h5>The total amount you and your family spend per year. </h5></div>

    function handleSpendingChange(event) {
        props.setErrors(update(props.errors, {['spending']: {$set: getErrorForNumber(event.target.value)}}))
        props.setFormState(update(props.formState, {['spending']: {$set: event.target.value}}));
        props.setStale();
    }

    return <FormInputMoney error={props.errors.spending} handleChange={handleSpendingChange} value={props.formState.spending} placeHolder={'spending'} popOver={spendingPopOver}>
        Annual Spending
    </FormInputMoney>;
}

function TargetRetirementAgeInput(props) {
    const targetRetirementAgePopOver = <div><h5><strong>Optional:</strong> The date you want to retire.</h5>
        <h5>Leave blank to let LifeSplat calculate your earliest feasible retirement date.</h5></div>

    let targetRetirementAge = 'targetRetirementAge';

    function handleChange(event) {
        props.setErrors(update(props.errors, {[targetRetirementAge]: {$set: getValidAgeError(event.target.value)}}))
        props.setFormState(update(props.formState, {[targetRetirementAge]: {$set: event.target.value}}));
        props.setStale();
    }

    return <FormInput error={props.errors[targetRetirementAge]} handleChange={handleChange} value={props.formState.targetRetirementAge} placeHolder={'optional'}
                      errorMessage={props.errors[targetRetirementAge]} inputClass="input-control-age" popOver={targetRetirementAgePopOver}>
        Target Retirement Age:
    </FormInput>;
}

function SpendingSteps(props){
    const spendingStepAmountPopOver = <div><h5>Annual amount you expect to spend.</h5></div>
    const spendingStepAgePopOver = <div><h5>The age you will start spending the new amount. </h5></div>
    
    function handleSpendingStepNumberChange(event, i, fieldName) {
        props.setStale();
        props.setErrors(update(props.errors, {['spendingSteps']:{[i]: {[fieldName]: {$set: getErrorForNumber(event.target.value)}}}}))
        props.setFormState(update(props.formState, {['spendingSteps']:{[i]: {[fieldName]: {$set: event.target.value}}}}))
    }
    
    let handleSpendingStepAgeChange = (spendingStepIndex) => (event) => handleSpendingStepNumberChange(event, spendingStepIndex, 'age')
    let handleSpendingStepAmountChange = (spendingStepIndex) => (event) => handleSpendingStepNumberChange(event, spendingStepIndex, 'amount')
    
    let steps = props.formState.spendingSteps.map((x, i)=>{
        return (<div className={"d-flex"} key={i}>
            <FormInput error={props.errors.spendingSteps[i].age} handleChange={handleSpendingStepAgeChange(i)} value={x.age} 
                       errorMessage={'Must be between 18 and 100'} inputClass="input-control-age" popOver={spendingStepAgePopOver}>
                Age:
            </FormInput>
            <FormInputMoney error={props.errors.spendingSteps[i].amount} handleChange={handleSpendingStepAmountChange(i)} value={x.spending} 
                            placeHolder={'spending'} popOver={spendingStepAmountPopOver}>
                Amount:
            </FormInputMoney>
        </div>)
    })
    
    return (<div className={"d-flex"}>{steps}</div>)
}



function InitialExplainer(){
    return <div className={"alert alert-primary"} style={{'max-width':'750px'}}>
        <h2>Welcome!</h2><h4>Enter your details to calculate your earliest feasible retirement date.</h4>
    </div>    
}

const salaryPopOver = <div><h5>Your pre tax annual salary</h5></div>

const savingsPopOver = <div><h5>Your total savings including investments e.g. cash, shares, bonds, funds, bitcoin, gold, rental property</h5><hr/>
                            <h5>Include anything that is easily convertible into money and that you own specifically as a store of wealth or to earn a profit.</h5><hr/>
                            <h5>For rental property include the cash value you would receive should you sell it i.e. minus mortgage repayment and other expenses</h5></div>

const pensionPopOver = <div><h5>The total cash value of your existing private pensions.</h5></div>

const employerContributionPopOver = <div><h5>The amount your employer contributes to your pension as a % or your salary</h5>
                                    <hr/><h5>3% is the minimum under auto enrolment, unless you opted out.</h5></div>

const employeeContributionPopOver = <div><h5>The amount you contribute to your pension as a % or your salary</h5>
                                    <hr/><h5>5% is the minimum under auto enrolment, unless you opted out.</h5></div>

const contributingYearsPopOver = <div><h5><strong>Optional:</strong> The number of qualifying years you have accrued towards your state pension.</h5><hr/>
    <h5>Leave blank to let LifeSplat estimate your contributions. LifeSplat will assume you've been contributing from age 21.</h5></div>


function PersonFormSection(props) {
    return <div id={"person" + props.index}>
        <div className="d-flex flex-wrap">
            <FormInputMoney error={props.errors[props.index].salary} handleChange={props.changeHandlers.salary} value={props.person.salary} placeHolder={'salary'} popOver={salaryPopOver}>
                Annual Salary
            </FormInputMoney>
            <FormInputMoney error={props.errors[props.index].savings} handleChange={props.changeHandlers.savings} value={props.person.savings} placeHolder={'savings'} popOver={savingsPopOver}>
                Savings
            </FormInputMoney>
            <FormInputMoney error={props.errors[props.index].pension} handleChange={props.changeHandlers.pension} value={props.person.pension} placeHolder={'pension'} popOver={pensionPopOver}>
                Existing Pension
            </FormInputMoney>
            <FormInputPercent error={props.errors[props.index].employerContribution} handleChange={props.changeHandlers.employerContribution} value={props.person.employerContribution}
                              popOver={employerContributionPopOver}>
                Employer Contribution
            </FormInputPercent>
            <FormInputPercent error={props.errors[props.index].employeeContribution} handleChange={props.changeHandlers.employeeContribution} value={props.person.employeeContribution} 
                              popOver={employeeContributionPopOver}>
                Employee Contribution
            </FormInputPercent>
            <div style={{'max-width':'115px'}}>
                    <FormInput error={props.errors[props.index].niContributingYears} handleChange={props.changeHandlers.niContributingYears} value={props.person.niContributingYears}
                               errorMessage={"Must be a number"} append={'years'} style={{'max-width':'30px'}} popOver={contributingYearsPopOver}>
                        N.I. Contributions
                    </FormInput>
            </div>
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
    let error = 'Must be a number.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error} append={'%'}
                      inputClass="input-control-percent" popOver={props.popOver}>
        {props.children}
    </FormInput>
}

function FormInputMoney(props) {
    let error = 'Must be a whole number.';
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={error} prepend={'£'}
                      inputClass="input-control-money" popOver={props.popOver}>
        {props.children}
    </FormInput>
}

function Pop(message) {
    return (<Popover id="popover-basic" visible={"false"}>
        <Popover.Content>
            {message}
        </Popover.Content>
    </Popover>)
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
            <OverlayTrigger trigger="focus" placement="top" popperConfig={{modifiers:[{name:'offset', options:{offset:[0,20]}}]}} overlay={Pop(props.popOver)}>
                <input type="text" placeholder={props.placeHolder}
                   className={"form-control " + (props.error ? "is-invalid" : "")}
                   onChange={props.handleChange}
                   value={props.value}/>
            </OverlayTrigger>
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
                        <input type="radio" className="form-check-input" name={"maleFemaleRadios" + props.index}
                               id={"maleRadios" + props.index} value="false" defaultChecked={true}/>
                        Male
                    </label>
                </div>
                <div className="form-check">
                    <label className="form-check-label">
                        <input type="radio" className="form-check-input" name={"maleFemaleRadios" + props.index}
                               id={"femaleRadios" + props.index} value="true"/>
                        Female
                    </label>
                </div>
            </div>
        </fieldset>
    </div>
}