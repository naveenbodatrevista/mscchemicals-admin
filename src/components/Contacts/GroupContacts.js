import { AppBar, Button, Tab, Tabs, TextField } from '@material-ui/core';
import axios from 'axios';
import lodash from 'lodash';
import React, { Component } from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Col,

    Input,
    Modal,

    ModalBody, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../Common/constants';
import CustomPagination from '../Common/CustomPagination';
import PageLoader from '../Common/PageLoader';
import TabPanel from '../Common/TabPanel';
import ContentWrapper from '../Layout/ContentWrapper';



class GroupContacts extends Component {
    state = {
        activeTab: 0,
        loading: false,
        modal1: false,
        modal2: false,
        id: 0,
        group: '',
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            search: ''
        },
        contacts: [],
        editFlag: false,
        newObj: {
            firstName: '',
            lastName: '',
            city: '',
            state: '',
            country: '',
            location: '',
            email: '',
            mobile: ''
        },
        uploadFile: '',

        addError: '',
        deleteError: '',
        updateError: ''
    };

    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    loadGroup() {
        axios.get(server_url + context_path + "api/groups/" + this.props.match.params.objId)
            .then(res => {
                this.setState({
                    id: res.data.id,
                    group: res.data
                });
            }).catch(err => {
                this.props.history.push('/groups');
            })
    }

    loadObjects(offset) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/contacts?sort=id,desc&page=" + (offset - 1) + "&group.id=" + this.props.match.params.objId; //+ "&uid=" + this.props.user.id 

        if (this.state.filters.search) {
            url += "&firstName=" + encodeURIComponent('%' + this.state.filters.search + '%');
        }

        axios.get(url)
            .then(res => {
                this.setState({
                    contacts: res.data._embedded.contacts,
                    page: res.data.page
                });
            })
    }

    componentDidMount() {
        this.loadGroup();
        this.loadObjects();
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

    addContact() {
        let newObj = {
            firstName: '',
            lastName: '',
            city: '',
            state: '',
            country: '',
            location: '',
            email: '',
            mobile: ''
        }
        this.setState({ editFlag: false });
        this.setState({ newObj });
        this.toggleTab(1);
    }
    editContact(idx) {
        let newObj = this.state.contacts[idx];
        let contact = lodash.cloneDeep(newObj);
        contact.idx = idx;

        this.setState({ editFlag: true });
        this.setState({ newObj });
        this.toggleTab(1);
    }
    deleteContact(idx) {
        axios.delete(server_url + context_path + "api/contacts/" + this.state.contacts[idx].id)
            .then(res => {
                this.state.contacts.splice(idx, 1);
                this.setState({ contacts: this.state.contacts });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ deleteError: err.response.data.globalErrors[0] });
                swal("Unable to Delete!", err.response.data.globalErrors[0], "error");
            })
    }

    setObjField(field, e) {
        var newObj = this.state.newObj;
        newObj[field] = e.target.value;
        this.setState({ newObj });
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

    onSubmit = e => {
        e.preventDefault();
        let newObj = this.state.newObj;
        newObj.uid = this.props.user.id;
        newObj.group = 'group/' + this.props.match.params.objId;
        let url = server_url + context_path + "api/contacts";

        this.setState({ loading: true });

        if (!this.state.editFlag) {
            axios.post(url, newObj)
                .then(res => {
                    this.toggleTab(0);

                    this.state.contacts.push(res.data);
                    this.setState({ contacts: this.state.contacts });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleTab(0);
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                });
        } else {
            axios.patch(url + "/" + newObj.id, newObj)
                .then(res => {
                    this.toggleTab(0);
                    var contacts = this.state.contacts;
                    contacts[newObj.idx] = res.data;
                    this.setState({ editFlag: false })
                    this.setState({ contacts: contacts });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleTab(0);
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Save!", err.response.data.globalErrors[0], "error");
                });
        }
    }

    updateContactsFile = e => {
        this.setState({ uploadFile: e.target.files[0] });
    }

    onSubmitUpload = e => {
        e.preventDefault();

        if (this.state.uploadFile.size > 10485760) {
            swal("File too large!", "File size should be < 10Mb", "error");
        } else {
            const data = new FormData()
            data.append('file', this.state.uploadFile);
            data.append('gid', this.props.match.params.objId);

            this.setState({ loading: true });

            axios.post(server_url + context_path + "contacts/upload", data)
                .then(res => {
                    this.toggleModal2();
                    this.loadObjects();
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleModal2();
                    this.setState({ addError: err.response.message });
                    swal("Unable to Add!", err.response.message, "error");
                })
        }
    }


    sampleContacts = () => {
        axios.post("/img/contacts.csv")
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'contacts.csv');
                document.body.appendChild(link);
                link.click();
            })
    }

    render() {
        const CSS = '.card-body > .btn, .card-body > a > .btn, .card-header .btn, .card-header a > .btn { margin: 0 4px 4px 0 }';

        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <style>{CSS}</style>
                <div className="content-heading">
                    <div>
                        {this.state.group.name} group contacts
                    </div>
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
                                <Tab label="Add Contact" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={this.state.activeTab} index={0}>
                            <div className="row">
                                <div className="col-md-2">
                                    <h4 className="float-right">Filters : </h4>
                                </div>
                                <div className="col-md-4">
                                    <TextField
                                        type="text"
                                        label="search contact"
                                        fullWidth={true}
                                        value={this.state.filters.search}
                                        onChange={this.searchObject}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <div className="float-right">
                                        <Link to='/bulk-sms'>
                                            <Button variant="contained" color="primary" size="xs">Bulk SMS</Button>
                                        </Link>

                                        <Link to='/bulk-mail'>
                                            <Button variant="contained" color="primary" size="xs">Bulk Mail</Button>
                                        </Link>

                                        <Button variant="contained" color="primary" size="xs" onClick={this.toggleModal2}>Upload Contacts</Button>
                                    </div>
                                </div>
                            </div>
                            <Table hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Mobile</th>
                                        <th>Email</th>
                                        <th>Created On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.contacts.map((contact, i) => {
                                        return (
                                            <tr key={contact.id}>
                                                <td>{i + 1}</td>
                                                <td>{contact.firstName}</td>
                                                <td>{contact.mobile}</td>
                                                <td>{contact.email}</td>
                                                <td>
                                                    <Moment format="DD MMM YY HH:mm">{contact.creationDate}</Moment>
                                                </td>
                                                <td>
                                                    <Button variant="contained" color="inverse" size="xs" onClick={() => this.editContact(i)}>Edit</Button>
                                                    <Button variant="contained" color="warning" size="xs" onClick={() => this.deleteContact(i)}>Delete</Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>

                            <CustomPagination page={this.state.page} onChange={this.loadObjects} />
                        </TabPanel>
                        <TabPanel value={this.state.activeTab} index={1}>
                            <form className="form-horizontal" onSubmit={this.onSubmit}>
                                <div className="row">
                                    <div className="col-md-6 offset-md-3">
                                        <fieldset>
                                            <TextField type="text" label="First Name" required={true} fullWidth={true}
                                                value={this.state.newObj.firstName} onChange={e => this.setObjField("firstName", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Last Name" required={true} fullWidth={true}
                                                value={this.state.newObj.lastName} onChange={e => this.setObjField("lastName", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Mobile" required={true} fullWidth={true}
                                                value={this.state.newObj.mobile} onChange={e => this.setObjField("mobile", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Email" required={true} fullWidth={true}
                                                value={this.state.newObj.email} onChange={e => this.setObjField("email", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Location" required={true} fullWidth={true}
                                                value={this.state.newObj.location} onChange={e => this.setObjField("location", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="City" required={true} fullWidth={true}
                                                value={this.state.newObj.city} onChange={e => this.setObjField("city", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="State" required={true} fullWidth={true}
                                                value={this.state.newObj.state} onChange={e => this.setObjField("state", e)}
                                            />
                                        </fieldset>
                                        <fieldset>
                                            <TextField type="text" label="Country" required={true} fullWidth={true}
                                                value={this.state.newObj.country} onChange={e => this.setObjField("country", e)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <div className="form-group row">
                                                <div className="col-12 text-center mt-3">
                                                    <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Submit</Button>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </form>
                        </TabPanel>

                        <Modal isOpen={this.state.modal2} toggle={this.toggleModal2}>
                            <ModalHeader toggle={this.toggleModal2}>Upload Contact</ModalHeader>
                            <ModalBody>
                                <form className="form-horizontal" onSubmit={this.onSubmitUpload}>
                                    <fieldset>
                                        <div className="form-group row">
                                            <label className="col-md-4 col-form-label">File input</label>
                                            <Col md={8}>
                                                {/* <input type="file" data-buttonname="btn-secondary m-0" data-classinput="form-control" className="filestyle" /> */}
                                                <Input
                                                    type='file' accept='.csv,.xls,.xlsx'
                                                    onChange={this.updateContactsFile} required
                                                />
                                                <span>*Please upload .csv,.xls,.xlsx files only</span>

                                            </Col>
                                        </div>
                                        <div className="form-group row">
                                            <Col md={12}>
                                                <a variant="contained" color="primary" size="xs" className="float-right btn btn-inverse btn-xs" href='/img/contacts.csv' download>Sample Contacts</a>
                                            </Col>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div className="form-group row text-center">
                                            <div className="col-sm-4 col-sm-offset-2">
                                                <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Save Contacts</Button>
                                            </div>
                                        </div>
                                    </fieldset>
                                </form>
                            </ModalBody>
                        </Modal>

                    </div>
                </div>
            </ContentWrapper>
        );
    }

}
const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(GroupContacts);