import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import update from 'immutability-helper';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import convertMoneyStringToInt from "../model/convertMoneyStringToInt";
import moment from "moment";

export default function UserInputForm(props) {
    let context = props.formContext;

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

    function handleAddSpendingStep(event){
        context.setFormStale()
        context.setErrors(update(context.errors, {spendingSteps: {$push: [{amount: '', age: ''}]}}))
        context.setFormState(update(context.formState, {spendingSteps: {$push: [{amount: '', age: ''}]}}))
        event.preventDefault();
    }

    function handleRemoveSpendingStep(event){
        context.setFormStale()
        context.errors.spendingSteps.pop()
        context.formState.spendingSteps.pop()
        context.setErrors(update(context.errors, {spendingSteps: {$set: Array.from(context.errors.spendingSteps)}}))
        context.setFormState(update(context.formState, {spendingSteps: {$set: Array.from(context.formState.spendingSteps)}}))
        event.preventDefault();
    }

    function handleAddRemovePartner(event) {
        if (context.formState.persons.length === 1) {
            context.formState.persons.push({dob: context.formState.persons[0].dob, rental: [], children: [], salarySteps: []})
            context.errors.persons.push({rental: [], salarySteps: []})
        } else {
            context.formState.persons.pop()
            context.errors.persons.pop()
        }
        context.setFormStale();
        context.setErrors(update(context.errors, {persons: {$set: Array.from(context.errors.persons)}}))
        context.setFormState(update(context.formState, {persons: {$set: Array.from(context.formState.persons)}}))

        event.preventDefault();
    }

    function submitForm(event) {
        event.preventDefault()
        let spendingStepsErrors = validateSpendingSteps(context.formState.spendingSteps, context.errors.spendingSteps);
        if(hasSpendingStepErrors(context.errors.spendingSteps)) {
            context.setErrors(update(context.errors, {spendingSteps: {$set: spendingStepsErrors}}))
            return;
        }
        if(setPensionContributionLimit(context))
            return;
        props.formSubmit()
    }


    function setPensionContributionLimit(context){
        let returnValue = false
        context.formState.persons.forEach((person, i) => {
            let salary = convertMoneyStringToInt(person.salary)
            let totalPensionContribution = (salary * (person.employerContribution/100)) + (salary * (person.employeeContribution/100));
                if (totalPensionContribution > 40000) {
                    let newErrors = {...context.errors};
                    newErrors.persons[i].employeeContribution = 'Pension contributions have exceeded £40,000'
                    context.setErrors(newErrors)
                    returnValue = true;
                }
                else
                {
                    let newErrors = {...context.errors};
                    newErrors.persons[i].employeeContribution = ''
                    context.setErrors(newErrors)
                }
            }
        )
        return returnValue;
    }
    
    return <div id="form">
        <form className="salaryForm mx-1 mx-md-3">
            <div className='' style={{width: '95vw'}}>
                <div id="formComponents" className="d-flex-column flex-wrap">
                    <div id="jointInputs">
                        <div className="centerAlign d-flex flex-wrap">
                            <StatefulMoneyInput context={props.formContext} path={['spending']} placeholder={'spending'} popOver={spendingPopOver}>
                                Annual Spending
                            </StatefulMoneyInput>
                            <StatefulMoneyInput context={props.formContext} path={['emergencyFund']} placeholder={'optional'} popOver={emergencyFundPopOver}
                                                validator={getMoneyOrMonthError}>
                                Emergency Fund
                            </StatefulMoneyInput>
                            <SpendingSteps formContext={props.formContext}/>
                            <button className="btn btn-primary mr-2 no-stretch" onClick={handleAddSpendingStep}>
                                {"Add Spending Step"}
                            </button>
                            {context.formState.spendingSteps.length > 0 ? <button className="btn btn-primary mr-2 no-stretch" onClick={handleRemoveSpendingStep}>
                                {"Remove"}
                            </button> : ''}
                            <TargetRetirementAgeInput formContext={props.formContext}/>
                        </div>
                    </div>
                    <PersonFormSection formContext={props.formContext} index={0}/>
                    {props.formContext.formState.persons.length > 1 ? <PersonFormSection formContext={props.formContext} index={1}/>  : ''}
                </div>
                <div>
                    <button className="btn btn-primary mr-2" onClick={handleAddRemovePartner}>
                        {context.formState.persons.length === 2 ? "Remove Partner" : "Add Partner"}
                    </button>
                    <button className={"btn mr-2 " + (props.fullyCalcd ? "btn-success" : "btn-warning")} disabled={context.errors.salary} onClick={submitForm}>
                        Calculate
                    </button>
                </div>
            </div>
        </form>
    </div>
}

function PersonFormSection(props) {
    function handleAddRental(event){
        event.preventDefault();
        props.formContext.setFormStale()
        props.formContext.setErrors(update(props.formContext.errors, {persons: {[props.index]: {rental: {$push: [{amount: '', age: ''}]}}}}))
        props.formContext.setFormState(update(props.formContext.formState, {persons: {[props.index]: {rental: {$push: [{amount: '', age: ''}]}}}}))
    }

    function handleRemoveRental(rentalIndex){
        return (event)=> {
            event.preventDefault();
            props.formContext.setFormStale()
            props.formContext.errors.persons[props.index].rental.splice(rentalIndex, 1)
            props.formContext.formState.persons[props.index].rental.splice(rentalIndex, 1)
            props.formContext.setErrors(update(props.formContext.errors, {persons: {[props.index]: {rental: {$set: Array.from(props.formContext.errors.persons[props.index].rental)}}}}))
            props.formContext.setFormState(update(props.formContext.formState, {persons: {[props.index]: {rental: {$set: Array.from(props.formContext.formState.persons[props.index].rental)}}}}))
        }
    }
    
    return <div id={"person" + props.index}>
        <div className="d-flex-column flex-wrap">
            <div className="centerAlign d-flex flex-wrap">
                <StatefulMoneyInput context={props.formContext} path={['persons', props.index, 'salary']} placeholder={'salary'} popOver={salaryPopOver}>
                    Annual Salary
                </StatefulMoneyInput>
                <SalarySteps formContext={props.formContext} personIndex={props.index}/>
                <StatefulMoneyInput context={props.formContext} path={['persons', props.index, 'savings']} placeholder={'savings'} popOver={savingsPopOver}>
                    Savings
                </StatefulMoneyInput>
                <StatefulMoneyInput context={props.formContext} path={['persons', props.index, 'pension']} placeholder={'pension'} popOver={pensionPopOver}>
                    Existing Pension
                </StatefulMoneyInput>
                <StatefulPercentInput context={props.formContext} path={['persons', props.index, 'employerContribution']} popOver={employerContributionPopOver}>
                    Employer Contribution
                </StatefulPercentInput>
                <StatefulPercentInput context={props.formContext} path={['persons', props.index, 'employeeContribution']} popOver={employeeContributionPopOver}>
                    Employee Contribution
                </StatefulPercentInput>
                <NiContributingYearsInput context={props.formContext} index={props.index}/>
                <DateInput context={props.formContext} index={props.index} path={['persons', props.index, 'dob']}>DOB</DateInput>
                <FormGenderRadio context={props.formContext} index={props.index}/>
                <ChildrenSection context={props.formContext} index={props.index}/>
                
                <button className="btn btn-primary mr-2 no-stretch"  onClick={handleAddRental}>
                    {"Add BTL"}
                </button>
            </div>
            <div>
                <RentalProperty formContext={props.formContext} personIndex={props.index} handleRemoveRental={handleRemoveRental} />
            </div>
        </div>
    </div>
}
function SalarySteps(props){
    let context = props.formContext
    const salaryStepAmountPopOver = <div>Annual amount you expect to earn. (Use todays figures i.e. don't add extra for inflation.</div>
    const salaryStepAgePopOver = <div>The age you will start earning the new amount.</div>


    let handleAddSalaryStepForPerson = (personIndex) => (event) => handleAddSalaryStep(event, personIndex)
    let handleRemoveSalaryStepForPerson = (personIndex) => (event) => handleRemoveSalaryStep(event, personIndex)

    function handleAddSalaryStep(event, personIndex){
        context.setFormStale()
        context.setErrors(update(context.errors, {persons: {[personIndex]: {salarySteps: {$push: [{amount: '', age: ''}]}}}}))
        context.setFormState(update(context.formState, {persons: {[personIndex]: {salarySteps: {$push: [{amount: '', age: ''}]}}}}))
        event.preventDefault();
    }

    function handleRemoveSalaryStep(event, personIndex){
        context.setFormStale()
        context.errors.persons[personIndex].salarySteps.pop()
        context.formState.persons[personIndex].salarySteps.pop()
        context.setErrors(update(context.errors, {persons: {[personIndex]: {salarySteps: {$set: Array.from(context.errors.persons[personIndex].salarySteps)}}}}))
        context.setFormState(update(context.formState, {persons: {[personIndex]: {salarySteps: {$set: Array.from(context.formState.persons[personIndex].salarySteps)}}}}))
        event.preventDefault();
    }

    function handleSalaryStepNumberChange(event, personIndex, stepIndex, fieldName, validator) {
        props.formContext.setFormStale();
        props.formContext.setErrors(update(props.formContext.errors, {persons: {[personIndex]: {salarySteps: {[stepIndex]: {[fieldName]: {$set: validator(event.target.value)}}}}}}))
        props.formContext.setFormState(update(props.formContext.formState, {persons: {[personIndex]: {salarySteps :{[stepIndex]: {[fieldName]: {$set: event.target.value}}}}}}))
    }

    let handleSalaryStepAgeChange = (salaryStepIndex, personIndex) => (event) => handleSalaryStepNumberChange(event, personIndex, salaryStepIndex, 'age', getErrorForValidNumberLessThan100)
    let handleSalaryStepAmountChange = (salaryStepIndex, personIndex) => (event) => handleSalaryStepNumberChange(event, personIndex, salaryStepIndex, 'amount', getErrorForNumber)

    let steps = props.formContext.formState.persons[props.personIndex].salarySteps.map((x, i)=>{
        return (<div className={"d-flex"} key={i}>
            <FormInput error={props.formContext.errors.persons[props.personIndex].salarySteps[i]?.age} handleChange={handleSalaryStepAgeChange(i, props.personIndex)} value={x.age}
                       errorMessage={'Must be between 18 and 100'} inputClass="input-control-age" popOver={salaryStepAgePopOver}>
                Age:
            </FormInput>
            <FormInputMoney error={props.formContext.errors.persons[props.personIndex].salarySteps[i]?.amount} handleChange={handleSalaryStepAmountChange(i, props.personIndex)} value={x.amount}
                            errorMessage={'Must be a whole number'} placeHolder={'salary'} popOver={salaryStepAmountPopOver}>
                Amount:
            </FormInputMoney>
        </div>)
    })

    return (<div className={"centerAlign d-flex"}>
        {steps}
        <button className="btn btn-primary mr-2 no-stretch" onClick={handleAddSalaryStepForPerson(props.personIndex)}>
            {"Add Salary Step"}
        </button>
        {context.formState.persons[props.personIndex].salarySteps.length > 0 ? <button className="btn btn-primary mr-2 no-stretch" onClick={handleRemoveSalaryStepForPerson(props.personIndex)}>
            {"Remove"}
        </button> : ''}
    </div>)
}

function ChildrenSection(props){
    
    function handleAddChild(event) {
        event.preventDefault();
        props.context.setFormStale()
        props.context.formState.persons[props.index].children.push(moment("1/1/2015").toDate())
        props.context.setFormState({...props.context.formState})
    }

    function removeAddChild(event) {
        event.preventDefault();
        props.context.setFormStale()
        props.context.formState.persons[props.index].children.pop()
        props.context.setFormState({...props.context.formState})
    }

    function childrenSection(context, personIndex) {
        return context.formState.persons[personIndex].children.map((c, i, )=>{
            return <DateInput context={context} personIndex={personIndex} childIndex={i} path={['persons', personIndex, 'children', i]}>{'Dob - Child ' + (i+1)}</DateInput>
        })
    }

    function disableAddChildBenefit(formState, personIndex) {
        let otherPersonIndex = personIndex === 0 ? 1 : 0;
        return formState.persons[otherPersonIndex]?.children.length > 0
    }

    return (<div className="centerAlign d-flex flex-wrap">
        {childrenSection(props.context, props.index)}
        <button className="btn btn-primary mr-2 no-stretch" onClick={handleAddChild} disabled={disableAddChildBenefit(props.context.formState, props.index)}>
            {"Add Child Benefit"}
        </button>
        {
            props.context.formState.persons[props.index].children.length > 0 
            ?
                <button className="btn btn-primary mr-2 no-stretch"  onClick={removeAddChild}>
                    {"Remove Child"}
                </button>
            : ''
        }
    </div>)
}

function NiContributingYearsInput(props) {
    let path = ['persons', props.index, 'niContributingYears']

    function handleChange(event) {
        props.context.setErrors(update(props.context.errors, getSetObject(path, getErrorForNumber(event.target.value))))
        props.context.setFormState(update(props.context.formState, getSetObject(path, event.target.value)))
        props.context.setFormStale();
    }

    return <div className={'max-width-115'}>
        <FormInput className={'max-width-30'} error={props.context.errors.persons[props.index].niContributingYears} handleChange={handleChange} 
                   value={props.context.formState.persons[props.index].niContributingYears} errorMessage={"Must be a number"} append={'years'} popOver={contributingYearsPopOver}>
            N.I. Contributions
        </FormInput>
    </div>
}

function DateInput(props) {
    let path = props.path

    function handleChange(event) {
        props.context.setFormState(update(props.context.formState, getSetObject(path, event)))
        props.context.setFormStale();
    }

    return <div className="form-group">
        <FormGroupLabel>{props.children}</FormGroupLabel>
        <div className=""><DatePicker
            selected={navigate(props.context.formState, path)}
            onChange={handleChange}
            showYearDropdown
            showMonthDropdown
            dateFormat="dd/MM/yyyy"
            className="date-picker mr-1"/>
        </div>
    </div>
}

function TargetRetirementAgeInput(props) {
    const targetRetirementAgePopOver = <div><strong>Optional:</strong> The date you want to retire.
        Leave blank to let LifeSplat calculate your earliest feasible retirement date.</div>

    let targetRetirementAge = 'targetRetirementAge';

    function handleChange(event) {
        props.formContext.setErrors(update(props.formContext.errors, {[targetRetirementAge]: {$set: getValidAgeError(event.target.value)}}))
        props.formContext.setFormState(update(props.formContext.formState, {[targetRetirementAge]: {$set: event.target.value}}));
        props.formContext.setFormStale();
    }

    return <FormInput error={props.formContext.errors[targetRetirementAge]} handleChange={handleChange} value={props.formContext.formState.targetRetirementAge} placeHolder={'optional'}
                      errorMessage={props.formContext.errors[targetRetirementAge]} inputClass="input-control-age" popOver={targetRetirementAgePopOver}>
        Target Retirement Age
    </FormInput>;
}

function SpendingSteps(props){
    const spendingStepAmountPopOver = <div>Annual amount you expect to spend.</div>
    const spendingStepAgePopOver = <div>The age you will start spending the new amount. </div>

    function handleSpendingStepNumberChange(event, i, fieldName, validator) {
        props.formContext.setFormStale();
        props.formContext.setErrors(update(props.formContext.errors, {spendingSteps: {[i]: {[fieldName]: {$set: validator(event.target.value)}}}}))
        props.formContext.setFormState(update(props.formContext.formState, {spendingSteps :{[i]: {[fieldName]: {$set: event.target.value}}}}))
    }

    let handleSpendingStepAgeChange = (spendingStepIndex) => (event) => handleSpendingStepNumberChange(event, spendingStepIndex, 'age', getErrorForValidNumberLessThan100)
    let handleSpendingStepAmountChange = (spendingStepIndex) => (event) => handleSpendingStepNumberChange(event, spendingStepIndex, 'amount', getErrorForNumber)

    let steps = props.formContext.formState.spendingSteps.map((x, i)=>{
        return (<div className={"d-flex"} key={i}>
            <FormInput error={props.formContext.errors.spendingSteps[i].age} handleChange={handleSpendingStepAgeChange(i)} value={x.age}
                       errorMessage={'Must be between 18 and 100'} inputClass="input-control-age" popOver={spendingStepAgePopOver}>
                Age:
            </FormInput>
            <FormInputMoney error={props.formContext.errors.spendingSteps[i].amount} handleChange={handleSpendingStepAmountChange(i)} value={x.spending}
                            errorMessage={'Must be a whole number'} placeHolder={'spending'} popOver={spendingStepAmountPopOver}>
                Amount:
            </FormInputMoney>
        </div>)
    })

    return (<div className={"d-flex"}>{steps}</div>)
}

function RentalProperty(props){
    const grossRentPopover = <div>Annual amount of tax deductible expenses (exlcuding financing costs)</div>
    const financingCostsPopOver = <div>Annual finacing costs - including mortgage interest AND arrangement fees (if you remortgage every 5 years divide the fees by 5 to give an annual number)</div>
    const expensesPopOver = <div>Annual amount of tax deductible expenses (exlcuding financing costs)</div>

    function handleRentalPropertyNumberChange(event, rentalIndex, fieldName, validator) {
        props.formContext.setFormStale();
        props.formContext.setErrors(update(props.formContext.errors, {persons: {[props.personIndex]: {rental: {[rentalIndex]: {[fieldName]: {$set: validator(event.target.value)}}}}}}))
        props.formContext.setFormState(update(props.formContext.formState, {persons: {[props.personIndex]: {rental :{[rentalIndex]: {[fieldName]: {$set: event.target.value}}}}}}))
    }

    let handleGrossRentChange = (rentalIndex) => (event) => handleRentalPropertyNumberChange(event, rentalIndex, 'grossRent', getErrorForNumber)
    let financingCostsChange = (rentalIndex) => (event) => handleRentalPropertyNumberChange(event, rentalIndex, 'mortgageCosts', getErrorForNumber)
    let expensesChange = (rentalIndex) => (event) => handleRentalPropertyNumberChange(event, rentalIndex, 'expenses', getErrorForNumber)

    let steps = props.formContext.formState.persons[props.personIndex].rental.map((x, i)=>{
        return (<div key={i}>
            <div  className="centerAlign d-flex flex-wrap" >
                <FormInputMoney error={props.formContext.errors.persons[props.personIndex].rental[i].grossRent} handleChange={handleGrossRentChange(i)} value={x.grossRent}
                            errorMessage={'Must be a whole number'} placeHolder={''} popOver={grossRentPopover}>
                    Gross Rent:
                </FormInputMoney>
                <FormInputMoney error={props.formContext.errors.persons[props.personIndex].rental[i].mortgageCosts} handleChange={financingCostsChange(i)} value={x.mortgageCosts}
                                errorMessage={'Must be a whole number'} placeHolder={''} popOver={financingCostsPopOver}>
                    Mortgage Costs:
                </FormInputMoney>
                <FormInputMoney error={props.formContext.errors.persons[props.personIndex].rental[i].expenses} handleChange={expensesChange(i)} value={x.expenses}
                                errorMessage={'Must be a whole number'} placeHolder={''} popOver={expensesPopOver}>
                    Expenses:
                </FormInputMoney>
                <button className="btn btn-primary mr-2 no-stretch" onClick={props.handleRemoveRental(i)}>
                    {"Remove"}
                </button>
            </div>
        </div>)
    })

    return (<div className={"d-flex-column"}>{steps}</div>)
}

function FormGenderRadio(props) {
    function handleMaleFemale(event) {
        props.context.setFormStale()
        props.context.setFormState(update(props.context.formState, {persons: {[props.index]: {female: {$set: event.target.value === "true"}}}}))
    }

    return <div className="mr-2 mt-3">
        <fieldset className="form-group" onChange={handleMaleFemale}>
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

function StatefulMoneyInput(props) {
    let validator = props.validator ?? getErrorForNumber
    function handleChange(event) {
        props.context.setErrors(update(props.context.errors, getSetObject(props.path, validator(event.target.value))))
        props.context.setFormState(update(props.context.formState, getSetObject(props.path, event.target.value)))
        props.context.setFormStale();
    }

    return <FormInputMoney error={navigate(props.context.errors, props.path)} handleChange={handleChange} value={navigate(props.context.formState, props.path)}
                           placeHolder={props.salary} popOver={props.popOver}>
        {props.children}
    </FormInputMoney>;
}

function StatefulPercentInput(props) {
    function handleChange(event) {
        props.context.setErrors(update(props.context.errors, getSetObject(props.path, getErrorForPercent(event.target.value))))
        props.context.setFormState(update(props.context.formState, getSetObject(props.path, event.target.value)))
        props.context.setFormStale();
    }

    return <FormInputPercent error={navigate(props.context.errors, props.path)} handleChange={handleChange} value={navigate(props.context.formState, props.path)}
                             placeHolder={props.salary} popOver={props.popOver}>
        {props.children}
    </FormInputPercent>;
}

function FormGroupLabel(props) {
    return <div className="no-wrap"><small>{props.children}</small></div>
}

function FormInputPercent(props) {
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={props.error} append={'%'}
                      inputClass="input-control-percent" popOver={props.popOver}>
        {props.children}
    </FormInput>
}

function FormInputMoney(props) {
    return <FormInput error={props.error} handleChange={props.handleChange} value={props.value} errorMessage={props.error} prepend={'£'}
                      inputClass="input-control-money" popOver={props.popOver}>
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

function Pop(message) {
    return (<Popover id="popover-basic" visible={"false"}>
        <Popover.Content>
            {message}
        </Popover.Content>
    </Popover>)
}

//***Popovers
const spendingPopOver = <div>The total amount you and your family spend per year. e.g. 20000 or 20k.</div>

const emergencyFundPopOver = <div>The amount of cash savings you aim to keep. Specified as an amount e.g. 2000, 2k. Or a number of months e.g. 3m.</div>

const salaryPopOver = <div>Your pre tax annual salary e.g. 20000 or 20k.</div>

const savingsPopOver = <div>Your current TOTAL savings including cash, emergemcy fund, and investments e.g. shares, bonds, funds, bitcoin, gold, rental.</div>

const pensionPopOver = <div>The total cash value of your existing private pensions.</div>

const employerContributionPopOver = <div>The amount your employer contributes to your pension as a % or your salary.
    <br/>3% is the minimum under auto enrolment, unless you opted out.</div>

const employeeContributionPopOver = <div>The amount you contribute to your pension as a % or your salary.
    <br/>5% is the minimum under auto enrolment, unless you opted out.</div>

const contributingYearsPopOver = <div><strong>Optional:</strong> The number of qualifying years you have accrued towards your state pension so far. 
    Leave blank to let LifeSplat estimate your contributions so far based on contributions from age 21.<br/>
    Future years will be projected based on earnings and children.</div>

//***Validators
function getValidAgeError(value) {
    if (value && (!value.match(/^\d+$/) || (value.match(/^\d+$/) && parseInt(value) > 100))) {
        return "Must be a number between 18 and 100";
    } else {
        return "";
    }
}

function getErrorForNumber(value) {
    if(!value)
        return
    if(value.match(/^\d+$/) ||value.match(/^\d+[kK]$/))
        return
    return "Must be a whole number e.g. 2000, 2k" ;
}

function getErrorForValidNumberLessThan100(value) {
    if(!value.match(/^\d+$/) || parseInt(value) > 100)
        return "Must be between 18 and 100"
}

function between18and100(age) {
    age = parseInt(age)
    return age >= 18 && age < 100;
}

function isAWholeNumber(numberString) {
    return getErrorForNumber(numberString) === undefined;
}

function getMoneyOrMonthError(value) {
    if(!value)
        return
    if(value.match(/^\d+$/) ||value.match(/^\d+[kK]$/) || value.match(/^\d+[mM]$/))
        return
    return "Must be a whole number or a number of months e.g. 2000, 2k or 3m" ;
}

function getErrorForPercent(value) {
    return value && !value.match(/^\d+(\.\d{0,2})?$/) ? "Must be a number" : "";
}

//***Utilities
//gets a value from an object using given path
function navigate(object, path) {
    let result = object
    path.forEach((x) => result = result[x])
    return result
}

//produces a change object as required by immutability-helper library
function getSetObject(path, value) {
    let reversePath = Array.from(path).reverse()

    let object = {$set: value};

    reversePath.forEach((x)=>
    {
        let newObject = {[x]: object}
        object = newObject;
    })

    return object;
}