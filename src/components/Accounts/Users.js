import MomentUtils from '@date-io/moment';
import { AppBar, Button, FormControl, Tab, Tabs, TextField } from '@material-ui/core';
import Event from '@material-ui/icons/Event';
import {
    DatePicker,
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import axios from 'axios';
import React, { Component } from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Col,

    Input, Table
} from 'reactstrap';
import swal from 'sweetalert';
import AutoSuggest from '../Common/AutoSuggest';
import { context_path, defaultDateFilter, server_url } from '../Common/constants';
import CustomPagination from '../Common/CustomPagination';
import FileDownload from '../Common/FileDownload';
import PageLoader from '../Common/PageLoader';
import Sorter from '../Common/Sorter';
import TabPanel from '../Common/TabPanel';
import ContentWrapper from '../Layout/ContentWrapper';




const json2csv = require('json2csv').parse;

class Users extends Component {
    state = {
        activeTab: 0,
        loading: false,
        modal1: false,
        modal2: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        editFlag: false,
        filters: {
            search: '',
            category: '',
            fromDate: null,
            toDate: null,

        },
        orderBy: 'id,desc',
        addError: '',
        patchError: '',
        updateError: '',
        basePath: server_url + context_path + 'api/users/',
        all: [],
        objects: [],
        newObj: {
            name: '',
            mobile: '',
            email: '@mscgroup.co.in',
            password: '',
            category: null,
            role: '',
            selectedRole: '',
        },
    };

    loadObjects(offset, all, callBack) {
        if (!offset) offset = 1;

        var url = this.state.basePath + "?projection=user_details&page=" + (offset - 1);


        if (this.state.orderBy) {
            url += '&sort=' + this.state.orderBy;
        }

        url += "&role.defaultRole=false";

        if (this.state.filters.search) {
            url += "&name=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        if (this.state.filters.category) {
            url += "&category=" + this.state.filters.category;
        }

        url = defaultDateFilter(this.state, url);

        if (all) {
            url += "&size=100000";
        }

        axios.get(url)
            .then(res => {
                if (all) {
                    this.setState({
                        all: res.data._embedded.users
                    });
                } else {
                    this.setState({
                        objects: res.data._embedded.users,
                        page: res.data.page
                    });
                }

                if (callBack) {
                    callBack();
                }
            })
    }

    componentDidMount() {
        this.loadObjects();
    }

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
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

    searchObject = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search = str;
        this.setState({ filters }, o => { this.loadObjects() });
    }

    searchCategory(e) {
        var filters = this.state.filters;
        filters.category = e.target.value;
        this.setState({ filters }, o => {
            this.loadObjects();
        });
    };

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
            this.setState({ orderBy: 'id,desc' }, this.loadObjects)
        } else {
            var direction = col.status === 1 ? 'desc' : 'asc';
            this.setState({ orderBy: col.param + ',' + direction }, this.loadObjects);
        }
    }



    setObjField(field, e) {
        var newObj = this.state.newObj;
        newObj[field] = e.target.value;
        this.setState({ newObj });
    }

    setAutoSuggest(field, val) {
        var newObj = this.state.newObj;
        newObj[field] = val;
        this.setState({ newObj });
    }

    addObj = () => {
        this.resetObj();
        this.setState({ editFlag: false });

        this.toggleTab(1)
    }

    editObj = (i) => {
        var user = this.state.objects[i];

        this.setState({ editFlag: true });

        axios.get(this.state.basePath + user.id + '?projection=user_details').then(res => {
            res.data.password = '';

            var newObj = res.data;

            newObj.selectedRole = newObj.role;
            newObj.role = newObj.role.id;
            
            this.setState({ newObj });

            this.toggleTab(1)
        })
    }

    resetObj() {
        var newObj = {
            name: '',
            mobile: '',
            email: '@mscgroup.co.in',
            password: '',
            category: null,
            role: '',
            selectedRole: '',
        }

        this.setState({ newObj });
    }

    onSubmit = e => {
        e.preventDefault();

        var url = this.state.basePath;

        var newObj = this.state.newObj;

        if(!newObj.role) {
            swal("Unable to Save!", "Role is missing", "error");
            return;
        }

        newObj.role = '/roles/' + newObj.role;

        this.setState({ loading: true });

        if (this.state.editFlag) {
            url += this.state.newObj.id;
            this.state.newObj.email = undefined;
            if (newObj.password.length == 0) {
                newObj.password = undefined;
            }

            axios.patch(url, newObj)
                .then(res => {
                    this.toggleTab(0);

                    if (res.status === 200) {
                        this.loadObjects();
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleTab(0);
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Edit!", err.response.data.globalErrors[0], "error");
                })
        } else {
            newObj.parent = this.props.user.id;

            axios.post(url, newObj)
                .then(res => {
                    this.toggleTab(0);

                    this.loadObjects();
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    console.log(err);
                    // this.toggleTab(0);
                    if(err.response){
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Add!",err.response.data.globalErrors[0], "error");
                    }
                })
        }
    }

    patchObj(idx) {
        var user = this.state.objects[idx];

        if (user.id != this.props.user.id) {
            axios.patch(server_url + context_path + "admin/users/" + user.id)
                .then(res => {
                    this.state.objects[idx].enabled = !this.state.objects[idx].enabled;
                    this.setState({ objects: this.state.objects });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.setState({ patchError: err.response.data.globalErrors[0] });
                    swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
                })
        } else {
            swal("Unable to Inactivate!", "Cann't inactivate yourself.", "warning");
        }
    }

    printReport() {
        this.loadObjects(this.state.offset, true, () => {
            window.print();
        });
    }

    downloadReport = () => {
        const fields = ['id', 'name', 'email', 'mobile', 'creationDate'];
        const opts = { fields };

        this.loadObjects(this.state.offset, true, () => {
            var csv = json2csv(this.state.all, opts);
            FileDownload.download(csv, 'reports.csv', 'text/csv');
        });
    }

    render() {
        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <div className="content-heading">
                    Users
                </div>
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
                                <Tab label="List" />
                                <Tab label="Add User" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={this.state.activeTab} index={0}>
                            <div className="row">
                                <div className="col-md-3">
                                    <h4 className="float-right">Filters : </h4>
                                </div>
                                <div className="col-md-2 form-group">
                                    <TextField
                                        type="text"
                                        label="search user"
                                        fullWidth={true}
                                        value={this.state.filters.search}
                                        onChange={this.searchObject} />
                                </div>
                                <div className="col-md-2">
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DatePicker 
                                        autoOk
                                        clearable
                                        disableFuture
                                        label="From Date"
                                        format="DD/MM/YYYY"
                                        value={this.state.filters.fromDate} 
                                        onChange={e => this.filterByDate(e, 'from')} 
                                                        TextFieldComponent={(props) => (
                                                            <TextField
                                                            type="text"
                                                            name="from"
                                                            id={props.id}
                                                            label={props.label}
                                                            onClick={props.onClick}
                                                            value={props.value}
                                                            disabled={props.disabled}
                                                            {...props.inputProps}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <Event />
                                                                ),
                                                            }}
                                                            />
                                                        )} />
                                    </MuiPickersUtilsProvider>
                                </div>
                                <div className="col-md-2">
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DatePicker 
                                        autoOk
                                        clearable
                                        disableFuture
                                        label="To Date"
                                        format="DD/MM/YYYY"
                                        value={this.state.filters.toDate} 
                                        onChange={e => this.filterByDate(e, 'to')} 
                                                        TextFieldComponent={(props) => (
                                                            <TextField
                                                            type="text"
                                                            name="to"
                                                            id={props.id}
                                                            label={props.label}
                                                            onClick={props.onClick}
                                                            value={props.value}
                                                            disabled={props.disabled}
                                                            {...props.inputProps}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <Event />
                                                                ),
                                                            }}
                                                            />
                                                        )} />
                                    </MuiPickersUtilsProvider>
                                </div>
                                <div className="col-md-3">
                                    <div className="float-right">
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.printReport()}>Print</Button>
                                        <Button className="d-none" variant="contained" color="secondary" size="small" onClick={() => this.downloadReport()}>Download</Button>
                                    </div>
                                </div>
                            </div>
                            <Table hover responsive>
                                <thead>
                                    <Sorter columns={[
                                        { name: '#', sortable: false }, 
                                        { name: 'Name', sortable: true, param: 'name' }, 
                                        { name: 'Email', sortable: true, param: 'email' }, 
                                        { name: 'Mobile', sortable: true, param: 'mobile' }, 
                                        { name: 'Role', sortable: false, param: 'mobile' }, 
                                        { name: 'Created On', sortable: true, param: 'creationDate' }, 
                                        { name: 'Action', sortable: false }]} 
                                        onSort={this.onSort.bind(this)} />
                                </thead>
                                <tbody>
                                    {this.state.objects.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <Link to={`/users/${obj.id}`}>
                                                        {obj.name}
                                                    </Link>
                                                </td>
                                                <td>{obj.email}</td>
                                                <td>{obj.mobile}</td>
                                                <td>
                                                    <Link to={`/roles/${obj.role.id}`}>
                                                        {obj.role.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                                <td>
                                                    <Button variant="contained" color="inverse" size="xs" onClick={() => this.editObj(i)}>Edit</Button>
                                                    <Button variant="contained" color="warning" size="xs" onClick={() => this.patchObj(i)}>{obj.enabled ? 'InActivate' : 'Activate'}</Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>

                            <CustomPagination page={this.state.page} onChange={(x) => this.loadObjects(x)} />

                            <Table id="printSection" responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Created On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.all.map((obj, i) => {
                                        return (
                                            <tr key={obj.id}>
                                                <td>{i + 1}</td>
                                                <td>{obj.name}</td>
                                                <td>{obj.email}</td>
                                                <td>{obj.mobile}</td>
                                                <td>{obj.role.name}</td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{obj.creationDate}</Moment>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </TabPanel>
                        <TabPanel value={this.state.activeTab} index={1}>
                            <form className="form-horizontal" onSubmit={this.onSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Name *</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('name', e)} minLength="2" maxLength="50" value={this.state.newObj.name} required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Email *</label>
                                                <Col md={8}>
                                                    <Input type="email" onChange={e => this.setObjField('email', e)} 
                                                    minLength="5" readOnly={this.state.editFlag} maxLength="100" 
                                                    value={this.state.newObj.email} pattern="[a-zA-Z0-9]*@mscgroup\.co\.in" required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Mobile *</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('mobile', e)} minLength="8" maxLength="15" value={this.state.newObj.mobile} required />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset>
                                            <div className="form-group row mb">
                                                <label className="col-md-4 col-form-label text-right">Password</label>
                                                <Col md={8}>
                                                    <Input type="text" onChange={e => this.setObjField('password', e)} minLength="5" maxLength="50" value={this.state.newObj.password} />
                                                </Col>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="col-md-4 offset-md-4">
                                        <fieldset>
                                            <FormControl>
                                                <AutoSuggest url="roles"
                                                    name="role"
                                                    displayColumns="name"
                                                    label="Role"
                                                    onRef={ref => {(this.roleASRef = ref)
                                                        if(ref){
                                                            this.roleASRef.setInitialField(this.state.newObj.selectedRole);
                                                        }
                                                    }}
                                                    placeholder="Search role by name"
                                                    arrayName="roles"
                                                    inputProps={{ "data-validate": '[{ "key":"required"}]' }}

                                                    projection="role_auto_suggest&defaultRole=false"
                                                    value={this.state.newObj.selectedRole}
                                                    onSelect={e => this.setAutoSuggest('role', e?.id)}
                                                    queryString="&name" ></AutoSuggest>
                                            </FormControl>
                                        </fieldset>
                                    </div>
                                </div>

                                <fieldset>
                                    <div className="form-group row">
                                        <div className="col-12 text-center mt-3">
                                            <button type="submit" className="btn btn-raised btn-primary">Save User</button>
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </TabPanel>
                    </div>
                </div>
            </ContentWrapper>
        );
    }

}
const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Users);