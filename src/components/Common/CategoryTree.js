import React from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Table
} from 'reactstrap';


class CategoryTree extends React.Component {
    
    render() {
        return (
        <Table hover responsive>
            <thead>
                <tr>
                    <th>Name</th>
                    <th></th>
                    <th>Sub Categories</th>
                </tr>
            </thead>
            <tbody>
                {this.props.categories.map((category, i) => {
                    return (
                    <tr key={category.id}>
                        <td>
                        {i + 1}. <Link to={`/${this.props.typePath}?category=${category.id}`}>{category.name}</Link>
                        </td>
                        <td>
                            <Button color="inverse" size="xs" onClick={() => this.props.editCategory(category)}>
                                <i className="fa fa-edit"></i>
                            </Button>
                            <Button color="warning" size="xs" onClick={() => this.props.deleteCategory(category)}
                                disabled={category.children.length > 0} title={category.children.length > 0 ? 'Can not delete category with childs' : ''}>
                                <i className="fa fa-trash"></i>
                            </Button>
                        </td>
                        <td>
                            <Button color="success" size="xs" onClick={() => this.props.addCategory(category)}>
                                <i className="fa fa-plus"></i> Add
                            </Button>
                            {category.children.length > 0 &&
                            <CategoryTree 
                            typePath={this.props.typePath} 
                            categories={category.children} 
                            addCategory={this.props.addCategory.bind(this)}
                            editCategory={this.props.editCategory.bind(this)}
                            deleteCategory={this.props.deleteCategory.bind(this)} />}
                        </td>
                    </tr>
                    )
                })}
            </tbody>
        </Table>
        )
    }
}

export default CategoryTree;