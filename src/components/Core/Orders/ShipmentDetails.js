import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
import axios from 'axios';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import { Row, Col, Modal,
//     ModalHeader,
//     ModalBody } from 'reactstrap';
// import Sorter from '../../Common/Sorter';

// import CustomPagination from '../../Common/CustomPagination';
import { server_url, context_path,  getStatusBadge } from '../../Common/constants';
import { Button,  } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

// import TabPanel from '../../Common/TabPanel';

import Status from '../Common/Status';
import AddShipmentDetails from './AddShipmentDetails';

// const json2csv = require('json2csv').parse;

class ShipmentDetails extends Component {
    state = {
        activeTab: 0,
        editFlag: false,
        modal: false,
        obj: '',
        baseUrl: 'inventory',
        currentId: '',
        status: [
            { label: 'On going', value: 'On going', badge: 'info' },
            { label: 'Completed', value: 'Completed', badge: 'success' },
        ],
    }


    loadObj(id) {
        axios.get(server_url + context_path + "api/" + this.state.baseUrl + "?order.id=" + id + '&projection=order_inventory_edit').then(res => {
            var list = res.data._embedded[Object.keys(res.data._embedded)[0]];

            if(list.length) {
                this.setState({ obj: list[0], currentId: list[0].id });
            }
        });
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        // console.log('inventory component did mount');
        // console.log(this.props.currentId);

        this.loadObj(this.props.currentId);
        this.props.onRef(this);
    }

    updateObj() {
        if(this.state.obj) {
            this.setState({ editFlag: true }, () => {
                this.addTemplateRef.updateObj(this.state.currentId);
            })
        } else {
            this.setState({ editFlag: true });
        }
    }

    saveSuccess(id) {
        this.setState({ editFlag: false });
        this.loadObj(this.props.currentId);
    }

    cancelSave = () => {
        this.setState({ editFlag: false });
    }

    updateStatus = (status) => {
        var obj = this.state.obj;
        obj.status = status;
        this.setState({ obj });
    }

    render() {
        return (
            <div>
                {!this.state.editFlag &&
                    <div className="row">
                        <div className="col-md-12">
                            {this.state.obj &&
                            <div className="card b">
                                <div className="card-header">
                                    <div className="float-right mt-2">
                                        <Status onRef={ref => (this.statusRef = ref)} baseUrl={this.state.baseUrl} currentId={this.state.currentId}
                                            onUpdate={(id) => this.updateStatus(id)} statusList={this.state.status} status={this.state.obj.status}
                                            statusType="Delivery"></Status>

                                        <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Edit</Button>
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
                                                    <strong>Type</strong>
                                                </td>
                                                <td>{this.state.obj.type}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Invoice No</strong>
                                                </td>
                                                <td>{this.state.obj.invoiceNo}</td>
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
                                                    <strong>Phase</strong>
                                                </td>
                                                <td>{this.state.obj.phase}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Batch No</strong>
                                                </td>
                                                <td>{this.state.obj.batchNo}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Origin</strong>
                                                </td>
                                                <td>{this.state.obj.origin}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Destination</strong>
                                                </td>
                                                <td>{this.state.obj.destination}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>ETA</strong>
                                                </td>
                                                <td>{this.state.obj.eta}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Last Location</strong>
                                                </td>
                                                <td>{this.state.obj.lastLocation}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Packaging Type</strong>
                                                </td>
                                                <td>{this.state.obj.packagingType}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Package Count</strong>
                                                </td>
                                                <td>{this.state.obj.packageCount}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Transporter</strong>
                                                </td>
                                                <td>{this.state.obj.transporter}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>LR Date</strong>
                                                </td>
                                                <td><Moment format="DD MMM YY">{this.state.obj.lrDate}</Moment></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>LR Details</strong>
                                                </td>
                                                <td>{this.state.obj.lrDetails}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Transportation Charges</strong>
                                                </td>
                                                <td>{this.state.obj.transportationCharges}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Loading Unloading Charges</strong>
                                                </td>
                                                <td>{this.state.obj.loadingUnloadingCharges}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Proof Of Delivery</strong>
                                                </td>
                                                <td>{this.state.obj.proofOfDelivery}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Delivery Status</strong>
                                                </td>
                                                <td><span className={getStatusBadge(this.state.obj.status, this.state.status)}>{this.state.obj.status}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>}
                            {!this.state.obj &&
                            <div className="text-center">
                                <Button variant="contained" color="warning" size="xs" onClick={() => this.updateObj()}>Add ShipmentDetails</Button>
                            </div>}
                        </div>
                    </div>}
                {this.state.editFlag &&
                    <div className="card b">
                        <div className="card-body bb bt">
                            <AddShipmentDetails baseUrl={this.state.baseUrl} currentId={this.state.currentId} 
                            onRef={ref => (this.addTemplateRef = ref)} onSave={(id) => this.saveSuccess(id)} onCancel={this.cancelSave}
                            parentObj={this.props.parentObj}></AddShipmentDetails>
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
)(ShipmentDetails);