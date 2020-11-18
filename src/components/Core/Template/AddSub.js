import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';

import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';

import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import AutoSuggest from '../../Common/AutoSuggest';


import FormValidator from '../../Forms/FormValidator';
import { Card, CardHeader, CardBody, Input, TabContent, TabPane, Nav, NavItem, NavLink, Form, CustomInput } from 'reactstrap';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';


const json2csv = require('json2csv').parse;


class AddSub extends Component {

    state = {
        formWizard: {
            editFlag: false,
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {
                name: '',
                address: '',
                streetAddress: '',
                contact: '',
                locality: '',
                landmark: '',
                city: '',
                state: '',
                country: '',
                pincode: '',
                departmentName: '',
            },
            selectedcountry: ''
        },
        address: [
            { label: 'Company HQ', value: 'HQ' },
            { label: 'Branch', value: 'BR' },
            { label: 'Billing', value: 'BI' },
            { label: 'Plant', value: 'PL' },
            { label: 'Warehouse', value: 'WH' }
        ]

    }

    loadData() {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id)
            .then(res => {
                var formWizard = this.state.formWizard;

                var newobj = res.data;
                formWizard.selectedcountry = newobj.country;
                formWizard.obj = newobj;

                this.setState({ formWizard });
            });
    }

    createNewObj() {

        var formWizard = {
            globalErrors: [],
            msg: '',
            errors: {},
            obj: {

            }
        }
        this.setState({ formWizard });
    }

    updateObj(id) {
        var formWizard = this.state.formWizard;
        formWizard.obj.id = id;
        formWizard.editFlag = true;

        this.setState({ formWizard }, this.loadData);
    }

    setField(field, e, noValidate) {
        var formWizard = this.state.formWizard;

        var input = e.target;
        formWizard.obj[field] = e.target.value;
        this.setState({ formWizard });

        if (!noValidate) {
            const result = FormValidator.validate(input);
            formWizard.errors[input.name] = result;
            this.setState({
                formWizard
            });
        }
    }

    setSelectField(field, e) {
        this.setField(field, e, true);
    }

    setDateField(field, e) {
        var formWizard = this.state.formWizard;

        if(e) {
            formWizard.obj[field] = e.format();
        } else {
            formWizard.obj[field] = null;
        }

        this.setState({ formWizard });
    }

    setAutoSuggest(field, val) {
        var formWizard = this.state.formWizard;
        formWizard.obj[field] = val;
        formWizard['selected' + field] = val;
        this.setState({ formWizard });
    }

    checkForError() {
        const form = this.formWizardRef;

        const tabPane = document.getElementById('saveForm');
        const inputs = [].slice.call(tabPane.querySelectorAll('input,select'));
        const { errors, hasError } = FormValidator.bulkValidate(inputs);
        var formWizard = this.state.formWizard;
        formWizard.errors = errors;
        this.setState({ formWizard });
        console.log(errors);

        return hasError;
    }

    saveDetails() {
        var hasError = this.checkForError();

        if (!hasError) {

            var newObj = this.state.formWizard.obj;
            var promise = undefined;
            if (!this.state.formWizard.editFlag) {
                promise = axios.post(server_url + context_path + "api/" + this.props.baseUrl, newObj)
            } else {
                promise = axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.formWizard.obj.id, newObj)
            }
            promise.then(res => {
                var formw = this.state.formWizard;
                formw.obj.id = res.data.id;
                formw.msg = 'successfully Saved';


                this.props.onSave(res.data.id);

            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                // this.toggleTab(0);
                //this.setState({ addError: err.response.data.globalErrors[0] });
                var formWizard = this.state.formWizard;
                formWizard.globalErrors = [];
                if (err.response.data.globalErrors) {
                    err.response.data.fieldError.forEach(e => {
                        formWizard.globalErrors.push(e);
                    });
                }

                var errors = {};
                if (err.response.data.fieldError) {
                    err.response.data.fieldError.forEach(e => {

                        if (errors[e.field]) {
                            errors[e.field].push(e.errorMessage);
                        } else {
                            errors[e.field] = [];
                            errors[e.field].push(e.errorMessage);

                        }

                    });
                }
                var errorMessage="";
                if (err.response.data.globalErrors) {
                    err.response.data.globalErrors.forEach(e => {
                        errorMessage+=e+""
                    });
                }
                formWizard.errors = errors;
                this.setState({ formWizard });
                if(!errorMessage) errorMessage = "Please resolve the errors";
                swal("Unable to Save!", errorMessage, "error");
            })


        }
        return true;
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ loding: false });

        if (this.props.branchId) {
            axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.props.branchId)
                .then(res => {
                    var formWizard = this.state.formWizard;
                    formWizard.obj = res.data;
                    this.setState({ formWizard });

                })
        }

    }

    render() {
        const errors = this.state.formWizard.errors;

        return (
            <ContentWrapper>

                <Form className="form-horizontal" innerRef={this.formRef} name="formWizard" id="saveForm">

                    <div className="row">
                        <div className="col-md-8 offset-md-2">
                            <fieldset>
                                <TextField
                                    type="text"
                                    label="Branch Name"
                                    name="name"
                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"required"},{ "key":"minlen","param":"5"}]' }}
                                    helperText={errors?.name?.length > 0 ? errors?.name[0]?.msg : ""}
                                    error={errors?.name?.length > 0}

                                    fullWidth={true}

                                    value={this.state.formWizard.obj.name}
                                    onChange={e => this.setField('name', e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <InputLabel>Select Type</InputLabel>
                                    <Select
                                        label="Select Type..."
                                        name="type"
                                        value={this.state.formWizard.obj.type}
                                        inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.type?.length > 0 ? errors?.type[0]?.msg : ""}
                                        error={errors?.type?.length > 0}

                                        onChange={e => this.setSelectField('type', e)}
                                    >
                                        {this.state.address.map((e, keyIndex) => {
                                            return (
                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextareaAutosize placeholder="Street Address"
                                    name="streetAddress"
                                    inputProps={{ "data-validate": '[{ "key":"required"}]', maxLength: 50 }}
                                    fullWidth={true} rowsMin={3}
                                    value={this.state.formWizard.obj.streetAddress} onChange={e => this.setField("streetAddress", e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="locality"
                                    label="locality"
                                    required={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.locality?.length > 0 ? errors?.locality[0]?.msg : ""}
                                    error={errors?.locality?.length > 0}

                                    fullWidth={true}

                                    value={this.state.formWizard.obj.locality}
                                    onChange={e => this.setField('locality', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="landmark"
                                    label="Landmark"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.landmark?.length > 0 ? errors?.landmark[0]?.msg : ""}
                                    error={errors?.landmark?.length > 0}
                                    inputProps={{ minLength: 5, maxLength: 30 }}
                                    value={this.state.formWizard.obj.landmark}
                                    onChange={e => this.setField('landmark', e)} />
                            </fieldset>
                            <fieldset>
                                <FormControl>
                                    <AutoSuggest url="countries"
                                        name="companyName"
                                        displayColumns="name"
                                        label="Country"
                                        placeholder="Search Country by name"
                                        arrayName="countries"
                                        projection=""
                                        value={this.state.formWizard.selectedcountry}
                                        onSelect={e => this.setAutoSuggest('country', e.name)}
                                        queryString="&name" ></AutoSuggest>
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>

                                    <TextField
                                        type="text"
                                        name="state"
                                        label="State"
                                        required={true}
                                        fullWidth={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.state?.length > 0 ? errors?.state[0]?.msg : ""}
                                        error={errors?.state?.length > 0}
                                        inputProps={{ minLength: 5, maxLength: 30 }}
                                        value={this.state.formWizard.obj.state}
                                        onChange={e => this.setField('state', e)} />
                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <FormControl>

                                    <TextField
                                        type="text"
                                        name="city"
                                        label="City"
                                        required={true}
                                        fullWidth={true}
                                        inputProps={{ maxLength: 30, "data-validate": '[{ "key":"required"}]' }}
                                        helperText={errors?.city?.length > 0 ? errors?.city[0]?.msg : ""}
                                        error={errors?.city?.length > 0}
                                        inputProps={{ minLength: 5, maxLength: 30 }}
                                        value={this.state.formWizard.obj.city}
                                        onChange={e => this.setField('city', e)} />

                                </FormControl>
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="pincode"
                                    label="Pincode"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.pincode?.length > 0 ? errors?.pincode[0]?.msg : ""}
                                    error={errors?.pincode?.length > 0}

                                    value={this.state.formWizard.obj.pincode}
                                    onChange={e => this.setSelectField('pincode', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="departmentName"
                                    label="Department Name"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.departmentName?.length > 0 ? errors?.departmentName[0]?.msg : ""}
                                    error={errors?.departmentName?.length > 0}

                                    value={this.state.formWizard.obj.departmentName}
                                    onChange={e => this.setField('departmentName', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="text"
                                    name="phone"
                                    label="Phone"
                                    required={true}
                                    fullWidth={true}
                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}
                                    helperText={errors?.phone?.length > 0 ? errors?.phone[0]?.msg : ""}
                                    error={errors?.phone?.length > 0}
                                    value={this.state.formWizard.obj.phone}
                                    onChange={e => this.setField('phone', e)} />
                            </fieldset>
                            <fieldset>
                                <TextField
                                    type="email"
                                    name="email"
                                    label="Email"
                                    required={true}
                                    fullWidth={true}
                                    helperText={errors?.email?.length > 0 ? errors?.email[0]?.msg : ""}
                                    error={errors?.email?.length > 0}
                                    inputProps={{ minLength: 5, maxLength: 30, "data-validate": '[{ "key":"email"}]' }}
                                    value={this.state.formWizard.obj.email}
                                    onChange={e => this.setField('email', e)} />
                            </fieldset>

                            <div className="text-center">
                                <Button variant="contained" color="primary" onClick={e => this.saveDetails()}>Save</Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </ContentWrapper>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(AddSub);