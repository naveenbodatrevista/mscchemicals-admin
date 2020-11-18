// https://github.com/chriso/validator.js
import validator from 'validator';

/**
 * Helper methods to validate form inputs
 * using controlled components
 */
const FormValidator = {
    /**
     * Validate input element
     * @m.param element Dome element of the input
     * Uses the following attributes
     *     data-validate: array in json format with validation methods
     *     data-m.param: used to provide arguments for certain methods.
     */
    validate(element) {

        const isCheckbox = element.type === 'checkbox';
        const value = isCheckbox ? element.checked : element.value;
        const name = element.name;

        if (!name) throw new Error('Input name must not be empty.');

        // use getAttribute to support IE10+
         const validations = JSON.parse(element.getAttribute('data-validate'));
        
        let result = []
        if(validations && validations.length) {
            /*  Result of each validation must be true if the input is invalid
                and false if valid. */
                
            validations.forEach(m => {
                switch (m.key) {
                    case 'required':
                        
                        var isValid=isCheckbox ? value === false : validator.isEmpty(value);
                        if(isValid){
                            var obj= {key:m.key,msg:'Field is mandatory'}
                            result.push(obj);
                        }
                        break;
                    case 'email':
                        var isValid =!validator.isEmail(value);
                        if(isValid){
                            var obj= {key:m.key,msg:'Please enter valid email'}
                            result.push(obj);
                        }
                        break;
                    case 'number':
                        var isValid =  !validator.isNumeric(value);
                        if(isValid){
                        
                        var obj= {key:m.key,msg:'Field should be number'}
                            result.push(obj);
                        }
                        break;
                    case 'integer':
                        var isValid = !validator.isInt(value);
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should be integer'}
                            result.push(obj);
                        
                        }
                        break;
                    case 'alphanum':
                        var isValid = !validator.isAlphanumeric(value);
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should be alpha numeric'}
                            result.push(obj);
                        
                        }
                        break;
                    case 'url':
                        var isValid = !validator.isURL(value);
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should be url'}
                            result.push(obj);
                        
                        }
                        break;
                    case 'equalto':
                        // here we expect a valid ID as m.param
                        const value2 = document.getElementById(m.param).value;
                        var isValid = !validator.equals(value, value2);
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should be match'}
                            result.push(obj);
                        
                        }
                        break;
                    case 'minlen':
                        var isValid = !validator.isEmpty(value) && !validator.isLength(value, { min: Number(m.param) });
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should have minimum length: '+m.param}
                            result.push(obj);
                        }
                        break;
                    case 'maxlen':
                        var isValid = !validator.isEmpty(value) && !validator.isLength(value, { max: Number(m.param) });
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should have maximum length: '+m.param}
                            result.push(obj);
                        }
                        break;
                    case 'len':
                        const [min, max] = JSON.parse(m.param)
                        var isValid = !validator.isEmpty(value) &&  !validator.isLength(value, { min, max });
                        if(isValid){
                            var obj= {key:m.key,msg:'Field should have min length '+min+' maximum length: '+max}
                            result.push(obj);}
                        break;
                    case 'min':
                        var isValid = !validator.isInt(value, { min: validator.toInt(m.param) });
                        if(isValid){
                        var obj=  {key:m.key,msg:'Field should have minimum characters'};
                        result.push(obj);
                        }
                        break;
                    case 'max':
                        var isValid = !validator.isInt(value, { max: validator.toInt(m.param) });
                        if(isValid){
                            var obj=  {key:m.key,msg:'Field should not exceed maximum characters'};
                            result.push(obj);  
                    }
                        break;
                    case 'list':
                        const list = JSON.parse(m.param)
                        var isValid = !validator.isIn(value, list);
                        if(isValid){
                            var obj=  {status:isValid,message: isValid?'Invalid value':''};
                        }
                        break;
                    default:
                        throw new Error('Unrecognized validator.');
                }

            })
        }
        
        return result;
    },

    /**
     * Bulk validation of input elements.
     * Used with form elements collection.
     * @m.param  {Array} inputs Array for DOM element
     * @return {Object}       Contains array of error and a flag to
     *                        indicate if there was a validation error
     */
    bulkValidate(inputs) {
        let errors = {},
            hasError = false;

        inputs.forEach(input => {
            let result = this.validate(input)
            
            if (!hasError){
                hasError=result.length>0;
                
            } 
            errors = { ...errors, [input.name]: result }
            
            
        })
        
        return {
            errors,
            hasError
        }
    }
}

export default FormValidator;