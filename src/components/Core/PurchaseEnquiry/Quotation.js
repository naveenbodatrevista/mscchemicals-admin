import React, { Component } from 'react';
// import ContentWrapper from '../../Layout/ContentWrapper';
import { connect } from 'react-redux';
// import swal from 'sweetalert';
// import axios from 'axios';
// import Moment from 'react-moment';
// import { Link } from 'react-router-dom';
// import { Table } from 'reactstrap';
// import PageLoader from '../../Common/PageLoader';
// import { Row, Col, Modal,
//     ModalHeader,
//     ModalBody } from 'reactstrap';
// import Sorter from '../../Common/Sorter';

// import CustomPagination from '../../Common/CustomPagination';
// import { server_url, context_path, defaultDateFilter, getUniqueCode, getStatusBadge } from '../../Common/constants';
// import { Button, TextField, Select, MenuItem, InputLabel, FormControl, Tab, Tabs, AppBar } from '@material-ui/core';

import 'react-datetime/css/react-datetime.css';
// import MomentUtils from '@date-io/moment';
// import {
//     DatePicker,
//     MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import Event from '@material-ui/icons/Event';

// import TabPanel from '../../Common/TabPanel';

import Upload from '../Common/Upload';

// const json2csv = require('json2csv').parse;

class Quotation extends Component {
    state = {
        editFlag: false,
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    componentDidMount() {
        console.log('quotation component did mount');
        console.log(this.props.currentId);

        this.props.onRef(this);
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

    render() {
        return (
            <Upload onRef={ref => (this.uploadRef = ref)} fileFrom={this.props.baseUrl + '-quotation'} 
                    currentId={this.props.currentId} fileTypes={[{label: 'Attachment', expiryDate: true }]}></Upload>)
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    user: state.login.userObj
})

export default connect(
    mapStateToProps
)(Quotation);