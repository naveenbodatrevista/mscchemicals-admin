import React, { Component } from 'react';
import ContentWrapper from '../../../Layout/ContentWrapper';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Table } from 'reactstrap';
import PageLoader from '../../../Common/PageLoader';
import {
    Row, Col, Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';
import Sorter from '../../../Common/Sorter';
import CustomPagination from '../../../Common/CustomPagination';
import { server_url, context_path, defaultDateFilter, getUniqueCode } from '../../../Common/constants';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import Event from '@material-ui/icons/Event';
import TabPanel from '../../../Common/TabPanel';

import Add from '../../PurchaseEnquiry/Add';
import Upload from '../../Common/Upload';
import AddFollowup from './AddFollowup';
import Quotation from '../../PurchaseEnquiry/Quotation';

import { createOrder } from '../../Orders/Create';

const json2csv = require('json2csv').parse;

class View extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        editSubFlag: false,
        modal1: false,
        modal2: false,
        obj: '',
        selectedStatus: '',
        subObjs: [],
        newSubObj: {},
        orderBy:'id,desc',
        subPage: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            fromDate: null,
            toDate: null,
        },
        status: [
            { label: 'On going', value: 'On going' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Partially Rejected', value: 'Partially Rejected' },
            { label: 'Converted', value: 'Converted' },
        ],
        pharmaFileTypes: [
            {label: 'Sample with COA', expiryDate: false },
            {label: 'Working standard with COA', expiryDate: false },
            {label: 'Process Flow Chart', expiryDate: false },
            {label: 'Specifications', expiryDate: false },
            {label: 'MOA', expiryDate: false },
            {label: 'Declaration of Material origin', expiryDate: false },
            {label: 'Stability Study Data', expiryDate: false },
            {label: 'Shelf LifeResidual Solvents', expiryDate: false },
            {label: 'Heavy Metals', expiryDate: false },
            {label: 'NOTS', expiryDate: false },
            {label: 'Aflatoxins', expiryDate: false },
            {label: 'Residual Pesticides', expiryDate: false },
            {label: 'Functional Trial by R&D', expiryDate: false },
            {label: 'TSE/BE Declaration', expiryDate: false },
            {label: 'Gluten free Certificate', expiryDate: false },
            {label: 'GMO Certificate', expiryDate: false },
            {label: 'Dioxin Certificate', expiryDate: false },
            {label: 'Melanin', expiryDate: false },
            {label: 'MSDS', expiryDate: false },
            {label: 'GMP certificate', expiryDate: false },
            {label: 'Chromatograph', expiryDate: false },
            {label: 'ISO', expiryDate: false },
        ],
        foodFileTypes: [
            {label: 'Sample with COA', expiryDate: false },
            {label: 'Working standard with COA', expiryDate: false },
            {label: 'Process Flow Chart', expiryDate: false },
            {label: 'Specifications', expiryDate: false },
            {label: 'MOA', expiryDate: false },
            {label: 'Declaration on Material Origin', expiryDate: false },
            {label: 'Stability study Data', expiryDate: false },
            {label: 'Shelf life', expiryDate: false },
            {label: 'Residual solvents', expiryDate: false },
            {label: 'Heavy Metals', expiryDate: false },
            {label: 'NOTS', expiryDate: false },
            {label: 'Aflatoxins', expiryDate: false },
            {label: 'Residual Pesticides', expiryDate: false },
            {label: 'Functional Trial by R&D', expiryDate: false },
            {label: 'TSE/BSE Certificate', expiryDate: false },
            {label: 'Gluten Free Certificate', expiryDate: false },
            {label: 'GMO Certificate', expiryDate: false },
            {label: 'GMP certificate', expiryDate: false },
            {label: 'Dioxin certificate', expiryDate: false },
            {label: 'Melanin Certificate', expiryDate: false },
            {label: 'MSDS', expiryDate: false },
            {label: 'Kosher Certificate', expiryDate: false },
            {label: 'Halal Certificate', expiryDate: false },
            {label: 'ISOUSFDA', expiryDate: false },
            {label: 'Other Country certificate', expiryDate: false },
        ]
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    searchSubObj = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadSubObjs() });
    }

    filterByDate(e, field) {
        var filters = this.state.filters;

        if(e) {
            filters[field + 'Date'] = e.format();
        } else {
            filters[field + 'Date'] = null;
        }

        this.setState({ filters: filters }, g => { this.loadObjects(); });
    }

    onSort(e, col) {
        if (col.status === 0) {
            this.setState({ orderBy: 'id,desc' }, this.loadSubObjs)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadSubObjs);
        }
    }

    loadSubObjs(offset, callBack) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/purchase-followup?enquiry.id="+this.props.currentId+"&page=" + (offset - 1);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }

        url += "&company=" + this.props.currentId;

        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        url = defaultDateFilter(this.state, url);

        axios.get(url)
            .then(res => {
                this.setState({
                    subObjs: res.data._embedded[Object.keys(res.data._embedded)[0]],
                    subPage: res.data.page
                });

                if (callBack) {
                    callBack();
                }
            })
    }



    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.props.baseUrl + "/" + id + '?projection=purchases_edit').then(res => {
            this.setState({ obj: res.data, selectedStatus: res.data.status });
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        console.log('view component did mount');
        console.log(this.props.currentId);

        this.loadObj(this.props.currentId);
        this.loadSubObjs();
        this.props.onRef(this);
    }

    patchStatus = e => {
        e.preventDefault();

        axios.patch(server_url + context_path + "api/" + this.props.baseUrl + "/" + this.state.obj.id, {status: this.state.selectedStatus})
            .then(res => {
                var obj = this.state.obj;
                obj.status = this.state.selectedStatus;
                this.setState({ obj });
            }).finally(() => {
                this.setState({ loading: false });
                this.toggleModal2();
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    updateObj() {
        this.setState({ editFlag: true }, () => {
            this.addTemplateRef.updateObj(this.props.currentId);
        })
    }

    saveSuccess(id) {
        this.setState({ editFlag: false });
    }

    cancelSave = () => {
        this.setState({ editFlag: false });
    }


    toggleModal1 = () => {
        this.setState({
            modal1: !this.state.modal1
        });
    }

    toggleModal2 = () => {
        this.setState({
            modal2: !this.state.modal2
        });
    }

    addSubObj = () => {
        this.setState({ editSubFlag: false });

        this.toggleModal1();
    }

    editSubObj = (i) => {
        var obj = this.state.subObjs[i].id;

        this.setState({ editSubFlag: true, subId: obj }, this.toggleModal1);
    }

    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal1();
        this.loadSubObjs();
    }

    convertToOrder = () => {
        createOrder('Purchase', this.state.obj, this.props.baseUrl);
    }

    render() {
        return (
            <div>
                <div className="content-heading">Purchase Enquiry</div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            <AppBar position="static">
                                <Tabs
                                    className="bg-white"
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="scrollable auto tabs example"
                                    value={this.state.activeTab}
                                    onChange={(e, i) => this.toggleTab(i)} >
                                    <Tab label="Details" />
                                    <Tab label="Quotation" />
                                    <Tab label="Followups" />
                                    <Tab label="Pharma Documents" />
                                    <Tab label="Food Documents" />
                                </Tabs>
                            </AppBar>
                            {this.state.obj &&
                            <TabPanel value={this.state.activeTab} index={0}>
                                <Modal isOpen={this.state.modal2} toggle={this.toggleModal2}>
                                    <ModalHeader toggle={this.toggleModal2}>
                                        Status Update
                                    </ModalHeader>
                                    <ModalBody>
                                        <form className="form-horizontal" onSubmit={this.patchStatus}>
                                            <fieldset>
                                                <FormControl>
                                                    <InputLabel>Enquiry Status</InputLabel>
                                                    <Select label="Enquiry Status" name="status"
                                                        value={this.state.selectedStatus}
                                                        onChange={e => this.setState({selectedStatus: e.target.value})}> 
                                                        {this.state.status.map((e, keyIndex) => {
                                                            return (
                                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </fieldset>

                                            <fieldset>
                                                <div className="form-group text-center">
                                                    <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Save</Button>
                                                </div>
                                            </fieldset>
                                        </form>
                                    </ModalBody>
                                </Modal>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Edit</Button>
                                            <Button variant="contained" color="warning" size="xs" onClick={this.toggleModal2}>Update Status</Button>
                                            {!this.state.obj.order &&
                                                <Button variant="contained" color="warning" size="xs" onClick={this.convertToOrder}>Convert To Order</Button>}
                                            {this.state.obj.order &&
                                            <Link to={`/orders/${this.state.obj.order}`}>
                                                <Button variant="contained" color="warning" size="xs">Open Order</Button>
                                            </Link>}
                                        </div>
                                        <h4 className="my-2">
                                            <span>{this.state.obj.name}</span>
                                        </h4>
                                    </div>
                                    <div className="card-body bb bt">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>Code</strong>
                                                    </td>
                                                    <td>{this.state.obj.code}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Enquiry Date</strong>
                                                    </td>
                                                    <td><Moment format="DD MMM YY">{this.state.obj.enquiryDate}</Moment></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Company</strong>
                                                    </td>
                                                    <td>
                                                        <Link to={`/companies/${this.state.obj.company.id}`}>
                                                            {this.state.obj.company.name}
                                                        </Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Contact Name</strong>
                                                    </td>
                                                    <td>{this.state.obj.contactName}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Email</strong>
                                                    </td>
                                                    <td>{this.state.obj.email}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Phone</strong>
                                                    </td>
                                                    <td>{this.state.obj.phone}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Source</strong>
                                                    </td>
                                                    <td>{this.state.obj.source}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Enquiry Status</strong>
                                                    </td>
                                                    <td><span className={getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Description</strong>
                                                    </td>
                                                    <td>{this.state.obj.description}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Product</strong>
                                                    </td>
                                                    <td>
                                                        <Link to={`/products/${this.state.obj.product.id}`}>
                                                            {this.state.obj.product.name}
                                                        </Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Quantity</strong>
                                                    </td>
                                                    <td>{this.state.obj.quantity}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Amount</strong>
                                                    </td>
                                                    <td>{this.state.obj.amount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabPanel>}
                            <TabPanel value={this.state.activeTab} index={1}>
                                <Quotation baseUrl={this.props.baseUrl} onRef={ref => (this.quotationTemplateRef = ref)} 
                                currentId={this.props.currentId}></Quotation>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={2}>
                                <Modal isOpen={this.state.modal1} toggle={this.toggleModal1} size={'lg'}>
                                    <ModalHeader toggle={this.toggleModal1}>
                                        {this.state.editSubFlag && <span>Edit </span>}
                                        {!this.state.editSubFlag && <span>Add </span>} Followup
                                </ModalHeader>
                                    <ModalBody>
                                         <AddFollowup baseUrl="purchase-followup" followupId={this.state.subId} subId={this.state.obj.id} onRef={ref => (this.addTemplateRef = ref)}
                                            onSave={(id) => this.saveObjSuccess(id)}></AddFollowup> 
                                    </ModalBody>
                                </Modal>
                                <div className="card b">
                                    <div className="card-header">
                                        <div className="float-right mt-2">
                                            <Button variant="contained" color="warning" size="xs" onClick={() => this.addSubObj()}>Add</Button>
                                        </div>
                                        <h4 className="my-2">
                                            <span>Followup</span>
                                        </h4>
                                    </div>
                                    <div className="card-body bb bt">
                                        <Table hover responsive>
                                            <thead>
                                                <Sorter columns={[
                                                    { name: '#', sortable: false },
                                                    { name: 'Followup Date', sortable: true, param: 'date' },
                                                    { name: 'Type', sortable: false, param: 'type' },
                                                    { name: 'Stage', sortable: true, param: 'stage' },
                                                    { name: 'Next Followup Date', sortable: true, param: 'creationDate' },
                                                    { name: 'Action', sortable: false }]}
                                                    onSort={this.onSort.bind(this)} />
                                            </thead>
                                            <tbody>
                                                {this.state.subObjs.map((obj, i) => {
                                                    return (
                                                        <tr key={obj.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                            <Moment format="DD MMM YY">{obj.followUpDate}</Moment>
                                                            </td>
                                                            <td>
                                                                {obj.type}
                                                            </td>
                                                            <td>
                                                                {obj.stage}
                                                            </td>
                                                            <td>
                                                                <Moment format="DD MMM YY">{obj.nextFollowUpDate}</Moment>
                                                            </td>
                                                            <td>
                                                                <Button variant="contained" color="warning" size="xs" onClick={() => this.editSubObj(i)}>Edit</Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>

                                        <CustomPagination page={this.state.subPage} onChange={(x) => this.loadSubObjs(x)} />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={3}>
                                <Upload onRef={ref => (this.pharmauploadRef = ref)} fileFrom={this.props.baseUrl + '_Pharma'} currentId={this.props.currentId} fileTypes={this.state.pharmaFileTypes}></Upload>
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={4}>
                                <Upload onRef={ref => (this.fooduploadRef = ref)} fileFrom={this.props.baseUrl + '_Food'} currentId={this.props.currentId} fileTypes={this.state.foodFileTypes}></Upload>
                            </TabPanel>
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <Add baseUrl={this.props.baseUrl} onRef={ref => (this.addTemplateRef = ref)}
                                onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}></Add>
                        </div>
                    </div>}
            </div>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(View);