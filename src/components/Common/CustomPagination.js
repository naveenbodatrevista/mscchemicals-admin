import React from "react";
import Pagination from "react-js-pagination";
import styled from "styled-components";

class CustomPagination extends React.Component {
    renderPagination = () => {
        var fromElement = (this.props.page.number * this.props.page.size) + 1;
        var toElement = fromElement + this.props.page.size - 1;

        if (toElement > this.props.page.totalElements) {
            toElement = this.props.page.totalElements;
        }

        var text = 'Showing ' + fromElement + ' to ' + toElement + ' of ' + this.props.page.totalElements + ' entries';

        var content = <div className="row text-center">
            {this.props.page.totalElements === 0 && <div className="col-sm-12">
                <Span2>No records found</Span2>
            </div>}
            {this.props.page.totalElements > 0 && this.props.page.totalPages > 1 && <div className="col-sm-12 col-md-5">
                <Span1>{text}</Span1>
            </div>}
            {this.props.page.totalElements > 0 && this.props.page.totalPages > 1 && <div className="col-sm-12 col-md-7">
                <Div2>
                    <Pagination
                        activePage={this.props.page.number + 1}
                        itemsCountPerPage={this.props.page.size}
                        totalItemsCount={this.props.page.totalElements}
                        pageRangeDisplayed={5}
                        onChange={this.props.onChange}
                        itemClass="page-item"
                        linkClass="page-link"
                        prevPageText="<"
                        nextPageText=">"
                    />
                </Div2>
            </div>}
        </div>;

        return content;
    }

    render() {
        const CSS = 'ul.pagination { white-space: nowrap; justify-content: flex-end; margin: 2px 0px; }';

        return (
            <Div1>
                <style>{CSS}</style>
                {this.renderPagination()}
            </Div1>
        );
    }
}

export default CustomPagination;

const Div1 = styled.div`
    margin: 20px 10px 0;
  `;

const Div2 = styled.div`
display: flex;
-webkit-justify-content: flex-end;
justify-content: flex-end;
flex-direction: column;
hite-space: nowrap;
text-align: right;
margin: 0px;

`;

const Span1 = styled.span`
    padding-top: 1em;
    white-space: nowrap;
    float: left;
  `;

const Span2 = styled.span`
    padding-top: 1em;
    white-space: nowrap;
    font-size: 16px;
  `;